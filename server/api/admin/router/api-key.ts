import { untypedClient } from '~~/server/utils/resources'

const SELECT = 'id, key_prefix, label, is_active, last_used_at, created_at, revoked_at'

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const client = untypedClient(event)

  if (event.method === 'GET') {
    const { data, error } = await client
      .from('ai_api_keys')
      .select(SELECT)
      .eq('is_active', true)
      .is('revoked_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throwDbError(error)
    return data
  }

  const raw = generatePublicKey()

  // Only the hash is stored; the raw key is returned exactly once and is
  // unrecoverable afterwards.
  const { error: revokeError } = await client
    .from('ai_api_keys')
    .update({ is_active: false, revoked_at: new Date().toISOString() })
    .eq('is_active', true)
    .is('revoked_at', null)

  if (revokeError) throwDbError(revokeError)

  const { data, error } = await client
    .from('ai_api_keys')
    .insert({
      key_prefix: raw.slice(0, 20),
      key_hash: await sha256hex(raw),
      label: 'Default',
      is_active: true,
    })
    .select(SELECT)
    .single()

  if (error) throwDbError(error)

  setResponseStatus(event, 201)
  return { key: raw, prefix: data.key_prefix, created_at: data.created_at }
})
