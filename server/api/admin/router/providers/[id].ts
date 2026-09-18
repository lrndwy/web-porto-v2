import { z } from 'zod'
import { providerUpdateSchema } from '#shared/schemas/router'
import { untypedClient } from '~~/server/utils/resources'

const SELECT = 'id, name, base_url, format, is_active, created_at, updated_at'

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const id = z.uuid().safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw createError({ statusCode: 400, statusMessage: 'invalid_id' })

  const client = untypedClient(event)

  if (event.method === 'DELETE') {
    // Only models block a delete, and they do so at the database level too
    // (`ai_models.provider_id` is `on delete restrict`): removing a provider
    // must never silently delete the models configured against it. Usage logs
    // are `on delete set null` and keep their history either way.
    const { count: modelCount } = await client
      .from('ai_models')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', id.data)

    if (modelCount) {
      throw createError({
        statusCode: 409,
        statusMessage: `${modelCount} model${modelCount === 1 ? '' : 's'} still use this provider. Delete ${modelCount === 1 ? 'it' : 'them'
          } first, or deactivate the provider instead.`,
      })
    }

    const { data, error } = await client
      .from('ai_providers')
      .delete()
      .eq('id', id.data)
      .select('id')
      .maybeSingle()

    if (error) throwDbError(error)
    if (!data) throw createError({ statusCode: 404, statusMessage: 'not_found' })
    return { ok: true, id: id.data }
  }

  const parsed = providerUpdateSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'validation_failed',
      data: { issues: parsed.error.issues },
    })
  }

  const { secret_api_key: secret, ...rest } = parsed.data
  if (secret === '') {
    throw createError({
      statusCode: 422,
      statusMessage: 'An empty key cannot be saved. Delete the provider to remove its secret.',
    })
  }

  // Absent or null leaves the stored secret untouched, so the masked form can
  // be saved without re-entering it.
  const values: Record<string, unknown> = { ...rest }
  if (typeof secret === 'string') values.secret_api_key = secret
  if (typeof rest.base_url === 'string') values.base_url = rest.base_url.replace(/\/$/, '')

  const { data, error } = await client
    .from('ai_providers')
    .update(values)
    .eq('id', id.data)
    .select(SELECT)
    .maybeSingle()

  if (error) throwDbError(error)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'not_found' })
  return data
})
