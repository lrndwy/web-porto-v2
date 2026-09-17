import { z } from 'zod'
import { untypedClient } from '~~/server/utils/resources'

/** Revoking is immediate: the router only accepts keys with no `revoked_at`. */
export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const id = z.uuid().safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw createError({ statusCode: 400, statusMessage: 'invalid_id' })

  const { data, error } = await untypedClient(event)
    .from('ai_api_keys')
    .update({ is_active: false, revoked_at: new Date().toISOString() })
    .eq('id', id.data)
    .select('id')
    .maybeSingle()

  if (error) throwDbError(error)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'not_found' })
  return { ok: true, id: id.data }
})
