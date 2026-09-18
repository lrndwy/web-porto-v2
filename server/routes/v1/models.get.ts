import { serverSupabaseServiceRole } from '#supabase/server'
import { sha256hex } from '#shared/utils/hash'

/**
 * The OpenAI-compatible model list. Clients such as the OpenAI SDK call this to
 * discover what they can address; it authenticates with the public key but does
 * not consume a rate-limit slot or a usage-log row, because it is not a
 * billable generation.
 */
export default defineEventHandler(async (event) => {
 const authorization = getHeader(event, 'authorization') ?? ''
 const token = authorization.startsWith('Bearer ')
  ? authorization.slice(7).trim()
  : (getHeader(event, 'x-api-key') ?? '').trim()

 if (!token) throw createError({ statusCode: 401, statusMessage: 'invalid_api_key' })

 const client = serverSupabaseServiceRole(event)

 const { data: key } = await client
  .from('ai_api_keys')
  .select('id')
  .eq('key_hash', await sha256hex(token))
  .eq('is_active', true)
  .is('revoked_at', null)
  .maybeSingle()

 if (!key) throw createError({ statusCode: 401, statusMessage: 'invalid_api_key' })

 const [modelsResult, providersResult] = await Promise.all([
  client.from('ai_models').select('display_name, provider_id, created_at').eq('is_active', true),
  client.from('ai_providers').select('id, name').eq('is_active', true),
 ])

 const providers = (providersResult.data ?? []) as { id: string; name: string }[]
 const providerNameById = new Map(providers.map((provider) => [provider.id, provider.name]))

 const data = ((modelsResult.data ?? []) as {
  display_name: string
  provider_id: string
  created_at: string
 }[])
  .filter((model) => providerNameById.has(model.provider_id))
  .map((model) => ({
   id: model.display_name,
   object: 'model',
   created: Math.floor(Date.parse(model.created_at) / 1000) || 0,
   owned_by: providerNameById.get(model.provider_id) ?? '',
  }))

 return { object: 'list', data }
})
