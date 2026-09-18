import type { H3Event } from 'h3'
import type { SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseServiceRole } from '#supabase/server'
import { anthropicRequestSchema, routerRequestSchema } from '#shared/schemas/router'
import {
 anthropicToOpenAI,
 anthropicToOpenAIResponse,
 openAIToAnthropic,
 openAIToAnthropicResponse,
} from '#shared/utils/ai-format'

/**
 * The public AI gateway. Both `/v1/chat/completions` (OpenAI shape) and
 * `/v1/messages` (Anthropic shape) run this, so the contract — the order of the
 * checks, the error codes, and the usage log — is identical whichever path a
 * client uses.
 *
 * The order of the checks below is contractual: each one short-circuits before
 * the next, and `scripts/router-probe.mjs` asserts the resulting status codes
 * and error codes. Every outcome from step 3 onward writes a usage log row; a
 * rejection before that point has no key to attribute the request to.
 */

export type ChatFormat = 'openai' | 'anthropic'

const MAX_BODY_BYTES = 128 * 1024
const UPSTREAM_TIMEOUT_MS = 60_000

const WINDOWS = [
 { type: 'minute', seconds: 60, field: 'requests_per_minute' },
 { type: 'hour', seconds: 3600, field: 'requests_per_hour' },
 { type: 'day', seconds: 86_400, field: 'requests_per_day' },
] as const

interface RouterSettings {
 is_enabled: boolean
 monthly_token_limit: number
 requests_per_minute: number
 requests_per_hour: number
 requests_per_day: number
 quota_exceeded_message: string
}

interface ProviderRow {
 id: string
 base_url: string
 secret_api_key: string | null
 is_active: boolean
 format: string | null
}

interface ModelRow {
 id: string
 display_name: string
 model_name: string
 provider_id: string
 is_active: boolean
}

/** The path and auth header a provider expects for a chat completion. */
function upstreamRequest(provider: ProviderRow): { url: string; headers: Record<string, string> } {
 const base = provider.base_url.replace(/\/$/, '')
 const secret = provider.secret_api_key

 if (provider.format === 'anthropic') {
  return {
   url: `${base}/messages`,
   headers: {
    'content-type': 'application/json',
    'anthropic-version': '2023-06-01',
    ...(secret ? { 'x-api-key': secret } : {}),
   },
  }
 }

 return {
  url: `${base}/chat/completions`,
  headers: {
   'content-type': 'application/json',
   ...(secret ? { authorization: `Bearer ${secret}` } : {}),
  },
 }
}

/** The body to forward, translated from the client's shape to the provider's. */
function upstreamBody(
 canonical: Record<string, unknown>,
 model: ModelRow,
 providerFormat: string,
 clientFormat: ChatFormat,
): Record<string, unknown> {
 if (providerFormat === clientFormat) return { ...canonical, model: model.model_name }
 if (providerFormat === 'anthropic') return { ...openAIToAnthropic(canonical), model: model.model_name }
 return { ...anthropicToOpenAI(canonical), model: model.model_name }
}

/** The upstream payload, translated back to the shape the client expects. */
function clientResponse(
 payload: Record<string, unknown>,
 model: ModelRow,
 providerFormat: string,
 clientFormat: ChatFormat,
): Record<string, unknown> {
 if (providerFormat === clientFormat) return payload
 if (clientFormat === 'anthropic') return openAIToAnthropicResponse(payload, model.display_name)
 return anthropicToOpenAIResponse(payload, model.display_name)
}

export async function runGateway(event: H3Event, clientFormat: ChatFormat): Promise<unknown> {
 const requestId = crypto.randomUUID()
 const startedAt = performance.now()
 setHeader(event, 'x-request-id', requestId)

 const client = serverSupabaseServiceRole(event) as unknown as SupabaseClient

 /** Every client-facing failure has this exact body. */
 const fail = async (
  statusCode: number,
  code: string,
  message: string,
  usage: {
   apiKeyId?: string | null
   providerId?: string | null
   modelId?: string | null
   tokens?: { input_tokens: number; output_tokens: number; total_tokens: number }
   headers?: Record<string, string>
  } = {},
 ) => {
  // Steps 1 and 2 have no key yet, so there is nothing to log against.
  if (usage.apiKeyId) {
   await client.from('ai_usage_logs').insert({
    api_key_id: usage.apiKeyId,
    provider_id: usage.providerId ?? null,
    model_id: usage.modelId ?? null,
    request_id: requestId,
    input_tokens: usage.tokens?.input_tokens ?? 0,
    output_tokens: usage.tokens?.output_tokens ?? 0,
    total_tokens: usage.tokens?.total_tokens ?? 0,
    status_code: statusCode,
    latency_ms: Math.round(performance.now() - startedAt),
    error_code: code,
   })
  }

  for (const [name, value] of Object.entries(usage.headers ?? {})) setHeader(event, name, value)
  setResponseStatus(event, statusCode)
  return { error: { code, message, request_id: requestId } }
 }

 // 1. Body size, before anything is read.
 const contentLength = Number(getHeader(event, 'content-length') ?? 0)
 if (contentLength > MAX_BODY_BYTES) {
  // The body is deliberately not drained: reading it would let a client cost
  // us bandwidth to be rejected. Asking for the connection to close instead
  // keeps the client's pool from waiting on a half-read request.
  setHeader(event, 'connection', 'close')
  return fail(413, 'payload_too_large', 'Request body exceeds 128 KB.')
 }

 // 2. A bearer token (OpenAI style) or `x-api-key` (Anthropic style) is required.
 const authorization = getHeader(event, 'authorization') ?? ''
 const token = authorization.startsWith('Bearer ')
  ? authorization.slice(7).trim()
  : (getHeader(event, 'x-api-key') ?? '').trim()

 if (!token) {
  return fail(
   401,
   'invalid_api_key',
   'Provide a public key as `Authorization: Bearer <key>` or `x-api-key: <key>`.',
  )
 }

 // 3. The token must match an active, unrevoked key.
 const { data: keyRow } = await client
  .from('ai_api_keys')
  .select('id, key_prefix')
  .eq('key_hash', await sha256hex(token))
  .eq('is_active', true)
  .is('revoked_at', null)
  .maybeSingle()

 const apiKey: { id: string; key_prefix: string } | null = keyRow
 if (!apiKey) {
  return fail(401, 'invalid_api_key', 'That public key is not valid.')
 }

 const { data: settingsRow } = await client
  .from('ai_router_settings')
  .select('*')
  .limit(1)
  .maybeSingle()
 const settings: RouterSettings | null = settingsRow

 // 4. The router can be switched off independently of the site.
 if (!settings?.is_enabled) {
  return fail(403, 'router_disabled', 'The router is currently disabled.', { apiKeyId: apiKey.id })
 }

 // 5. Rate limiting runs before the quota so a broken client cannot burn a
 //    month-long aggregate query on every request.
 for (const window of WINDOWS) {
  const limit = Number(settings[window.field] ?? 0)
  if (limit <= 0) continue

  const { data: hit, error } = await client.rpc('ai_rate_limit_hit', {
   p_identifier: apiKey.key_prefix,
   p_window_type: window.type,
   p_window_seconds: window.seconds,
   p_limit: limit,
  })
  if (error) throwDbError(error)

  const outcome = hit?.[0] as { allowed: boolean; reset_at: string } | undefined
  if (outcome && !outcome.allowed) {
   const retryAfter = Math.max(
    1,
    Math.ceil((Date.parse(outcome.reset_at) - Date.now()) / 1000),
   )
   return fail(429, 'rate_limited', `Too many requests. Retry in ${retryAfter}s.`, {
    apiKeyId: apiKey.id,
    headers: { 'retry-after': String(retryAfter) },
   })
  }
 }

 // 6. Month-to-date tokens against the monthly cap.
 const monthStart = new Date()
 monthStart.setUTCDate(1)
 monthStart.setUTCHours(0, 0, 0, 0)

 const { data: usageRows } = await client
  .from('ai_usage_logs')
  .select('total_tokens')
  .gte('created_at', monthStart.toISOString())

 const monthToDate = ((usageRows ?? []) as { total_tokens: number | null }[]).reduce(
  (sum, row) => sum + Number(row.total_tokens ?? 0),
  0,
 )
 const monthlyLimit = Number(settings.monthly_token_limit ?? 0)

 if (monthlyLimit > 0 && monthToDate >= monthlyLimit) {
  return fail(402, 'quota_exceeded', settings.quota_exceeded_message, { apiKeyId: apiKey.id })
 }

 // 7. Body shape, per the client's format.
 let body: unknown
 try {
  body = await readBody(event)
 } catch {
  return fail(422, 'invalid_request', 'The request body is not valid JSON.', { apiKeyId: apiKey.id })
 }

 const schema = clientFormat === 'anthropic' ? anthropicRequestSchema : routerRequestSchema
 const parsed = schema.safeParse(body)
 if (!parsed.success) {
  const paths = parsed.error.issues.map((issue) => issue.path.join('.')).filter(Boolean)
  return fail(
   422,
   'invalid_request',
   `The request body is invalid${paths.length ? `: ${[...new Set(paths)].join(', ')}` : ''}.`,
   { apiKeyId: apiKey.id },
  )
 }

 const canonical = parsed.data as Record<string, unknown>

 // Streaming would need the response to be piped and the usage to be counted
 // as it flows; the gateway buffers, so it refuses rather than return a body
 // that is not the stream the client asked for.
 if (canonical.stream === true) {
  return fail(422, 'streaming_unsupported', 'Streaming is not supported by this gateway.', {
   apiKeyId: apiKey.id,
  })
 }

 // 8. Resolve the model by its public display name.
 const { data: modelRow } = await client
  .from('ai_models')
  .select('*')
  .ilike('display_name', String(canonical.model))
  .maybeSingle()

 const model: ModelRow | null = modelRow
 if (!model) {
  return fail(404, 'model_not_found', `No model named "${canonical.model}".`, {
   apiKeyId: apiKey.id,
  })
 }
 if (!model.is_active) {
  return fail(404, 'model_inactive', `The model "${model.display_name}" is not available.`, {
   apiKeyId: apiKey.id,
   modelId: model.id,
  })
 }

 // 9. Its provider must be active too.
 const { data: providerRow } = await client
  .from('ai_providers')
  .select('*')
  .eq('id', model.provider_id)
  .maybeSingle()

 const provider: ProviderRow | null = providerRow
 if (!provider?.is_active) {
  return fail(502, 'provider_inactive', 'The provider for that model is not available.', {
   apiKeyId: apiKey.id,
   modelId: model.id,
   providerId: model.provider_id,
  })
 }

 // 10. Forward it, translated to the provider's shape.
 const providerFormat: ChatFormat = provider.format === 'anthropic' ? 'anthropic' : 'openai'
 const request = upstreamRequest(provider)

 let upstream: Response
 try {
  upstream = await fetch(request.url, {
   method: 'POST',
   headers: request.headers,
   body: JSON.stringify(upstreamBody(canonical, model, providerFormat, clientFormat)),
   signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  })
 } catch {
  return fail(502, 'upstream_error', 'The upstream provider could not be reached.', {
   apiKeyId: apiKey.id,
   modelId: model.id,
   providerId: provider.id,
  })
 }

 // 11. A non-2xx upstream response is a gateway error, never echoed back.
 if (!upstream.ok) {
  return fail(502, 'upstream_error', `The upstream provider returned ${upstream.status}.`, {
   apiKeyId: apiKey.id,
   modelId: model.id,
   providerId: provider.id,
  })
 }

 const payload = (await upstream.json()) as Record<string, unknown>
 const tokens = parseUsage(payload.usage)

 // 12. Record usage and stamp the key.
 await client.from('ai_usage_logs').insert({
  api_key_id: apiKey.id,
  provider_id: provider.id,
  model_id: model.id,
  request_id: requestId,
  input_tokens: tokens.input_tokens,
  output_tokens: tokens.output_tokens,
  total_tokens: tokens.total_tokens,
  status_code: 200,
  latency_ms: Math.round(performance.now() - startedAt),
  error_code: null,
 })

 await client
  .from('ai_api_keys')
  .update({ last_used_at: new Date().toISOString() })
  .eq('id', apiKey.id)

 setResponseStatus(event, 200)
 return clientResponse(payload, model, providerFormat, clientFormat)
}
