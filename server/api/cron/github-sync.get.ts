import { untypedClient } from '~~/server/utils/resources'
import { syncRepositories } from '~~/server/utils/github'

/**
 * Vercel cron target. Guarded by a shared secret rather than the Owner session,
 * because cron requests carry no cookies.
 */
export default defineEventHandler(async (event) => {
  const secret = useRuntimeConfig(event).cronSecret
  const header = getHeader(event, 'authorization') ?? ''

  if (!secret || header !== `Bearer ${secret}`) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }

  const client = untypedClient(event)

  // Opportunistic housekeeping: rate-limit windows are meaningless once a day
  // old, and the table would otherwise grow without bound.
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  await client.from('ai_rate_limits').delete().lt('expires_at', cutoff)

  const { data: settings } = await client
    .from('github_settings')
    .select('username, auto_sync')
    .limit(1)
    .maybeSingle()

  const config: { username?: string | null; auto_sync?: boolean } | null = settings
  if (!config?.auto_sync || !config.username) {
    return { ran: false, reason: config?.auto_sync ? 'no_username' : 'auto_sync_disabled' }
  }

  const token = useRuntimeConfig(event).githubToken || undefined
  const result = await syncRepositories(event, config.username, token)
  return { ran: true, ...result }
})
