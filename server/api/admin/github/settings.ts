import { z } from 'zod'
import { untypedClient } from '~~/server/utils/resources'

const settingsSchema = z.object({
  username: z.string().trim().max(100).nullable().optional(),
  max_projects: z.number().int().min(1).max(100),
  auto_sync: z.boolean(),
})

const SELECT = 'username, max_projects, auto_sync, last_synced_at'

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const client = untypedClient(event)

  if (event.method === 'GET') {
    const { data, error } = await client
      .from('github_settings')
      .select(SELECT)
      .limit(1)
      .maybeSingle()
    if (error) throwDbError(error)
    return data ?? { username: null, max_projects: 6, auto_sync: false, last_synced_at: null }
  }

  const parsed = settingsSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'validation_failed',
      data: { issues: parsed.error.issues },
    })
  }

  const values = { ...parsed.data, username: parsed.data.username || null }
  const { data, error } = await client
    .from('github_settings')
    .update(values)
    .not('id', 'is', null)
    .select(SELECT)
    .single()

  if (error) throwDbError(error)
  return data
})
