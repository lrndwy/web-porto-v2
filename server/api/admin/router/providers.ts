import { providerCreateSchema } from '#shared/schemas/router'
import { untypedClient } from '~~/server/utils/resources'

/** The stored secret is never returned; `has_secret` stands in for it. */
const SELECT = 'id, name, base_url, is_active, created_at, updated_at'

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const client = untypedClient(event)

  if (event.method === 'GET') {
    const { data, error } = await client
      .from('ai_providers')
      .select(`${SELECT}, secret_api_key`)
      .order('created_at', { ascending: true })
    if (error) throwDbError(error)

    // The secret itself never leaves the server; only its presence is reported.
    return ((data ?? []) as unknown as (Record<string, unknown> & { secret_api_key: string | null })[]).map(
      ({ secret_api_key, ...row }) => ({
        ...row,
        has_secret: !!secret_api_key,
      }),
    )
  }

  const parsed = providerCreateSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'validation_failed',
      data: { issues: parsed.error.issues },
    })
  }

  const { data, error } = await client
    .from('ai_providers')
    .insert({
      ...parsed.data,
      // A single trailing slash would produce `//chat/completions`.
      base_url: parsed.data.base_url.replace(/\/$/, ''),
    })
    .select(SELECT)
    .single()

  if (error) throwDbError(error)

  setResponseStatus(event, 201)
  return data
})
