import { untypedClient } from '~~/server/utils/resources'

// Shaped explicitly so `key_hash` never leaves the server.
const RETURNED_FIELDS = [
  'id',
  'key_prefix',
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
    // The whole key, not a prefix of it. The key is public by design — `/router`
    // publishes it — and storing only 20 characters made a working key
    // impossible to show or copy after the one-time reveal. `key_hash` remains
    // the lookup path, so validation never reads this column.
    key_prefix: raw,
    key_hash: await sha256hex(raw),
    label: 'Default',
    is_active: true,
  }

  const { data, error } = await client.from('ai_api_keys').insert(row).select('*').single()
  if (error) throwDbError(error)

  setResponseStatus(event, 201)
  return { key: raw, created_at: data.created_at }
})
