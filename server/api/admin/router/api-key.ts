import { untypedClient } from '~~/server/utils/resources'

// Read with `*` rather than a column list: `key_plain` arrives with a later
// migration, and naming it would make every read fail until that has been
// applied. The response is shaped explicitly below so `key_hash` never leaves
// the server.
const RETURNED_FIELDS = [
  'id',
  'key_prefix',
  'key_plain',
  'label',
  'is_active',
  'last_used_at',
  'created_at',
  'revoked_at',
] as const

function toPublicKey(row: Record<string, unknown>) {
  return Object.fromEntries(RETURNED_FIELDS.map((field) => [field, row[field] ?? null]))
}

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const client = untypedClient(event)

  if (event.method === 'GET') {
    const { data, error } = await client
      .from('ai_api_keys')
      .select('*')
      .eq('is_active', true)
      .is('revoked_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throwDbError(error)
    return data ? toPublicKey(data) : null
  }

  const raw = generatePublicKey()

  // Regenerating invalidates the previous key in the same sequence.
  const { error: revokeError } = await client
    .from('ai_api_keys')
    .update({ is_active: false, revoked_at: new Date().toISOString() })
    .eq('is_active', true)
    .is('revoked_at', null)

  if (revokeError) throwDbError(revokeError)

  const row = {
    key_prefix: raw.slice(0, 20),
    key_hash: await sha256hex(raw),
    // Public by design: `/router` publishes it so visitors can call the
    // endpoint. Bounded by rate limits and the monthly quota, not by secrecy.
    key_plain: raw,
    label: 'Default',
    is_active: true,
  }

  let created = await client.from('ai_api_keys').insert(row).select('*').single()

  // `key_plain` arrives with a later migration. Until it has been applied, the
  // key is still issued — it just cannot be displayed again afterwards.
  if (created.error && /key_plain/.test(created.error.message)) {
    const { key_plain: _omitted, ...withoutPlaintext } = row
    created = await client.from('ai_api_keys').insert(withoutPlaintext).select('*').single()
  }

  const { data, error } = created
  if (error) throwDbError(error)

  setResponseStatus(event, 201)
  return { key: raw, prefix: data.key_prefix, created_at: data.created_at }
})
