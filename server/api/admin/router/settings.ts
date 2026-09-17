import { routerSettingsSchema } from '#shared/schemas/router'
import { untypedClient } from '~~/server/utils/resources'

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const client = untypedClient(event)

  if (event.method === 'GET') {
    const { data, error } = await client.from('ai_router_settings').select('*').limit(1).maybeSingle()
    if (error) throwDbError(error)
    return data
  }

  const parsed = routerSettingsSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'validation_failed',
      data: { issues: parsed.error.issues },
    })
  }

  const { data, error } = await client
    .from('ai_router_settings')
    .update(parsed.data)
    .not('id', 'is', null)
    .select('*')
    .single()

  if (error) throwDbError(error)
  return data
})
