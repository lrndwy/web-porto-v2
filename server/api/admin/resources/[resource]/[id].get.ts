import { z } from 'zod'
import { untypedClient } from '~~/server/utils/resources'

/** Single-row read, so a dedicated edit page does not have to page the list. */
export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const def = getResource(getRouterParam(event, 'resource'))
  const id = z.uuid().safeParse(getRouterParam(event, 'id'))
  if (!id.success) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_id' })
  }

  const { data, error } = await untypedClient(event)
    .from(def.table)
    .select('*')
    .eq('id', id.data)
    .maybeSingle()

  if (error) throwDbError(error)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'not_found' })

  return data
})
