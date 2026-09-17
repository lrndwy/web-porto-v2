import { z } from 'zod'
import { untypedClient } from '~~/server/utils/resources'

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const def = getResource(getRouterParam(event, 'resource'))
  const id = z.uuid().safeParse(getRouterParam(event, 'id'))
  if (!id.success) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_id' })
  }

  const parsed = def.update.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'validation_failed',
      data: { issues: parsed.error.issues },
    })
  }

  const validated = parsed.data as Record<string, unknown>
  const values = def.normalize ? def.normalize(validated) : validated

  const { data, error } = await untypedClient(event)
    .from(def.table)
    .update(values)
    .eq('id', id.data)
    .select()
    .maybeSingle()

  if (error) throwDbError(error)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'not_found' })

  return data
})
