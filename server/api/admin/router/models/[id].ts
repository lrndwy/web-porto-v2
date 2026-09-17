import { z } from 'zod'
import { modelUpdateSchema } from '#shared/schemas/router'
import { untypedClient } from '~~/server/utils/resources'

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const id = z.uuid().safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw createError({ statusCode: 400, statusMessage: 'invalid_id' })

  const client = untypedClient(event)

  if (event.method === 'DELETE') {
    // Usage logs keep their history: `ai_usage_logs.model_id` is
    // `on delete set null`, so deleting a model nulls the reference rather than
    // destroying the audit trail. Refusing here would make a model that has
    // ever served a request impossible to remove.
    const { data, error } = await client
      .from('ai_models')
      .delete()
      .eq('id', id.data)
      .select('id')
      .maybeSingle()

    if (error) throwDbError(error)
    if (!data) throw createError({ statusCode: 404, statusMessage: 'not_found' })
    return { ok: true, id: id.data }
  }

  const parsed = modelUpdateSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'validation_failed',
      data: { issues: parsed.error.issues },
    })
  }

  if (parsed.data.display_name) {
    await assertDisplayNameFree(client, parsed.data.display_name, id.data)
  }

  const { data, error } = await client
    .from('ai_models')
    .update(parsed.data)
    .eq('id', id.data)
    .select(MODEL_SELECT)
    .maybeSingle()

  if (error) throwDbError(error)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'not_found' })
  return data
})
