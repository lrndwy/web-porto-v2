import { profileSchema } from '#shared/schemas/resources'
import { untypedClient } from '~~/server/utils/resources'

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const parsed = profileSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'validation_failed',
      data: { issues: parsed.error.issues },
    })
  }

  const client = untypedClient(event)
  const values = parsed.data as Record<string, unknown>

  const { data: existing } = await client
    .from('profiles')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const { data, error } = existing
    ? await client.from('profiles').update(values).eq('id', existing.id).select().single()
    : await client.from('profiles').insert(values).select().single()

  if (error) throwDbError(error)
  return data
})
