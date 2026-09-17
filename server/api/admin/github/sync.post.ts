import { untypedClient } from '~~/server/utils/resources'
import { syncRepositories } from '~~/server/utils/github'

/** A 60-second floor keeps a double-clicked button from hammering GitHub. */
const MIN_INTERVAL_MS = 60_000

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const client = untypedClient(event)
  const { data: settings } = await client
    .from('github_settings')
    .select('username, last_synced_at')
    .limit(1)
    .maybeSingle()

  const username = (settings as { username?: string | null } | null)?.username
  if (!username) {
    throw createError({ statusCode: 422, statusMessage: 'github_username_not_set' })
  }

  const lastSyncedAt = (settings as { last_synced_at?: string | null } | null)?.last_synced_at
  if (lastSyncedAt && Date.now() - Date.parse(lastSyncedAt) < MIN_INTERVAL_MS) {
    throw createError({ statusCode: 429, statusMessage: 'sync_too_soon' })
  }

  const token = useRuntimeConfig(event).githubToken || undefined
  return await syncRepositories(event, username, token)
})
