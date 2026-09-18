import { z } from 'zod'
import { untypedClient } from '~~/server/utils/resources'

/**
 * Sends a `GET /models` to the provider with the stored secret and reports
 * whether it answered. The secret and the upstream body are never returned.
 */
export default defineEventHandler(async (event) => {
 await requireOwner(event)

 const id = z.uuid().safeParse(getRouterParam(event, 'id'))
 if (!id.success) throw createError({ statusCode: 400, statusMessage: 'invalid_id' })

 const { data: provider } = await untypedClient(event)
  .from('ai_providers')
  .select('base_url, secret_api_key, format')
  .eq('id', id.data)
  .maybeSingle()

 const row: { base_url?: string; secret_api_key?: string | null; format?: string | null } | null = provider
 if (!row?.base_url) throw createError({ statusCode: 404, statusMessage: 'not_found' })

 const secret = row.secret_api_key
 const headers: Record<string, string> =
  row.format === 'anthropic'
   ? { 'anthropic-version': '2023-06-01', ...(secret ? { 'x-api-key': secret } : {}) }
   : { ...(secret ? { authorization: `Bearer ${secret}` } : {}) }

 try {
  const response = await fetch(`${row.base_url.replace(/\/$/, '')}/models`, {
   headers,
   signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) {
   return { ok: false, status: response.status, error: `Upstream returned ${response.status}` }
  }

  const payload = (await response.json()) as { data?: unknown[] }
  return { ok: true, status: response.status, modelCount: payload.data?.length ?? 0 }
 } catch (error) {
  const reason = error instanceof Error && error.name === 'TimeoutError' ? 'Timed out' : 'Unreachable'
  return { ok: false, status: 0, error: reason }
 }
})
