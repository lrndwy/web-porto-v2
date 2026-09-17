import { modelSchema } from '#shared/schemas/router'
import { untypedClient } from '~~/server/utils/resources'

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const client = untypedClient(event)

  if (event.method === 'GET') {
    const { data, error } = await client
      .from('ai_models')
      .select(MODEL_SELECT)
      .order('display_name', { ascending: true })
    if (error) throwDbError(error)
    return data ?? []
  }

  const parsed = modelSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'validation_failed',
      data: { issues: parsed.error.issues },
    })
  }

  await assertDisplayNameFree(client, parsed.data.display_name)

  const { data, error } = await client
    .from('ai_models')
    .insert(parsed.data)
    .select(MODEL_SELECT)
    .single()

  if (error) throwDbError(error)

  setResponseStatus(event, 201)
  return data
})
