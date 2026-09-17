import { z } from 'zod'
import { untypedClient } from '~~/server/utils/resources'

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const def = getResource(getRouterParam(event, 'resource'))
  const id = z.uuid().safeParse(getRouterParam(event, 'id'))
  if (!id.success) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_id' })
  }

  const { data, error } = await untypedClient(event)
    .from(def.table)
    .delete()
    .eq('id', id.data)
    .select('id')
    .maybeSingle()

  if (error) throwDbError(error)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'not_found' })

  return { ok: true, id: id.data }
})
