/**
 * End-to-end probe for the public AI Router.
 *
 *   ROUTER_BASE=http://localhost:3000 ROUTER_KEY=pk_uhuy_... \
 *     node scripts/router-probe.mjs
 *
 * Optionally set SUPABASE_URL and SUPABASE_SECRET_KEY to also assert that one
 * usage-log row exists per attempt, carrying the matching request id.
 *
 * The mutation cases (rate limit, quota, disabled, oversized body) change
 * `ai_router_settings` through the REST API when credentials are supplied, and
 * restore the previous values afterwards.
 */

const BASE = (process.env.ROUTER_BASE ?? 'http://localhost:3000').replace(/\/$/, '')
const KEY = process.env.ROUTER_KEY
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY
const MODEL = process.env.ROUTER_MODEL ?? 'mock-model'

if (!KEY) {
  console.error('ROUTER_KEY is required, e.g. ROUTER_KEY=pk_uhuy_... node scripts/router-probe.mjs')
  process.exit(2)
}

let passed = 0
let failed = 0
const requestIds = []

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1
    console.log(`  PASS  ${name}`)
  } else {
    failed += 1
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

async function callRouter({ key = KEY, body = {}, raw = false, headers = {} } = {}) {
  const payload = raw
    ? body
    : JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: 'Hello' }], ...body })

  const response = await fetch(`${BASE}/api/router`, {
    signal: AbortSignal.timeout(20_000),
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(key ? { authorization: `Bearer ${key}` } : {}),
      ...headers,
    },
    body: payload,
  })

  const text = await response.text()
  let json = null
  try {
    json = JSON.parse(text)
  } catch {
    json = null
  }

  const requestId = response.headers.get('x-request-id')
  if (requestId) requestIds.push({ requestId, status: response.status })

  return { status: response.status, json, headers: response.headers, requestId }
}

async function supabase(path, init = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    signal: AbortSignal.timeout(20_000),
    ...init,
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
}

async function readSettings() {
  const response = await supabase('ai_router_settings?select=*&limit=1')
  const [row] = await response.json()
  return row
}

async function patchSettings(values) {
  await supabase('ai_router_settings?id=not.is.null', {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}

console.log(`Probing ${BASE}/api/router as ${KEY.slice(0, 16)}…\n`)

// Read-and-clear first: a previous run (or manual testing) can leave an open
// fixed window behind, which would make every case below return 429.
const original = SUPABASE_URL && SUPABASE_SECRET_KEY ? await readSettings() : null
if (original) await supabase('ai_rate_limits?id=not.is.null', { method: 'DELETE' })

// 1. A valid key and an active model.
{
  const result = await callRouter()
  check('valid key returns 200', result.status === 200, `got ${result.status}`)
  check('body carries choices', Array.isArray(result.json?.choices), JSON.stringify(result.json)?.slice(0, 120))
  check('x-request-id present', !!result.requestId)
}

// 2. An unknown key.
{
  const result = await callRouter({ key: 'pk_uhuy_invalid' })
  check('invalid key returns 401', result.status === 401, `got ${result.status}`)
  check('error code is invalid_api_key', result.json?.error?.code === 'invalid_api_key')
}

// 3. An unknown model.
{
  const result = await callRouter({ body: { model: 'does-not-exist' } })
  check('unknown model returns 404', result.status === 404, `got ${result.status}`)
  check('error code is model_not_found', result.json?.error?.code === 'model_not_found')
}

// 4. A malformed body.
{
  const result = await callRouter({ body: { messages: [] } })
  check('missing messages returns 422', result.status === 422, `got ${result.status}`)
  check('error code is invalid_request', result.json?.error?.code === 'invalid_request')
}

// 5. An oversized body.
{
  const result = await callRouter({ body: { padding: 'x'.repeat(140 * 1024) } })
  check('oversized body returns 413', result.status === 413, `got ${result.status}`)
  check('error code is payload_too_large', result.json?.error?.code === 'payload_too_large')
}

if (original) {
  // 6. Rate limiting: two requests per minute, so the third is refused.
  {
    await patchSettings({ requests_per_minute: 2, requests_per_hour: 0, requests_per_day: 0 })
    await callRouter()
    await callRouter()
    const third = await callRouter()

    check('third rapid call returns 429', third.status === 429, `got ${third.status}`)
    check('error code is rate_limited', third.json?.error?.code === 'rate_limited')
    check('Retry-After header present', !!third.headers.get('retry-after'))

    await patchSettings({
      requests_per_minute: original.requests_per_minute,
      requests_per_hour: original.requests_per_hour,
      requests_per_day: original.requests_per_day,
    })
  }

  // 7. Quota exhausted.
  {
    await patchSettings({ monthly_token_limit: 1 })
    const result = await callRouter()
    check('exhausted quota returns 402', result.status === 402, `got ${result.status}`)
    check('error code is quota_exceeded', result.json?.error?.code === 'quota_exceeded')
    check(
      'message matches quota_exceeded_message',
      result.json?.error?.message === original.quota_exceeded_message,
    )
    await patchSettings({ monthly_token_limit: original.monthly_token_limit })
  }

  // 8. Router disabled.
  {
    await patchSettings({ is_enabled: false })
    const result = await callRouter()
    check('disabled router returns 403', result.status === 403, `got ${result.status}`)
    check('error code is router_disabled', result.json?.error?.code === 'router_disabled')
    await patchSettings({ is_enabled: original.is_enabled })
  }

  // 9. One usage-log row per attempt from step 3 onward. A rejection before the
  //    key is resolved (401) or before the body is read (413) has nothing to
  //    attribute the request to, so it is deliberately not logged.
  {
    const response = await supabase(
      `ai_usage_logs?select=request_id,status_code,error_code&order=created_at.desc&limit=100`,
    )
    const rows = await response.json()
    const byId = new Map(rows.map((row) => [row.request_id, row]))

    const attributable = requestIds.filter((entry) => entry.status !== 401 && entry.status !== 413)
    const missing = attributable.filter((entry) => !byId.has(entry.requestId))
    check('every attributable attempt has a usage log row', missing.length === 0, `${missing.length} missing`)

    const mismatched = attributable.filter((entry) => {
      const row = byId.get(entry.requestId)
      return row && row.status_code !== entry.status
    })
    check('logged status matches the response status', mismatched.length === 0)
  }
} else {
  console.log('\n  SKIP  mutation and usage-log cases (set SUPABASE_URL and SUPABASE_SECRET_KEY)')
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
