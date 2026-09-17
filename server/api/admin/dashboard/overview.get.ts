import { untypedClient } from '~~/server/utils/resources'

/**
 * Rolls up the analytics tables for the dashboard.
 *
 * The tables are small enough for plain reads plus in-process aggregation; a
 * materialised view would be more machinery than the volume justifies.
 */
export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const query = getQuery(event)
  const requested = stringParam(query.range)
  const range = isPeriodRange(requested) ? requested : '30d'
  const { from, to } = resolvePeriod(range)
  const previous = previousPeriod(range)

  const client = untypedClient(event)

  const [pageviews, sessions, visitors, postCount, projectCount, usage, settings] = await Promise.all([
    client
      .from('analytics_pageviews')
      .select('visitor_id, session_id, viewed_at')
      .gte('viewed_at', previous.from.toISOString())
      .lte('viewed_at', to.toISOString()),
    client
      .from('analytics_sessions')
      .select('id, started_at')
      .gte('started_at', previous.from.toISOString())
      .lte('started_at', to.toISOString()),
    client.from('analytics_visitors').select('id', { count: 'exact', head: true }),
    client.from('blog_posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    client.from('github_repositories').select('id', { count: 'exact', head: true }).eq('is_visible', true),
    client.from('ai_usage_logs').select('total_tokens, created_at, status_code').gte('created_at', from.toISOString()),
    client.from('ai_router_settings').select('*').limit(1).maybeSingle(),
  ])

  type Pageview = { visitor_id: string; session_id: string; viewed_at: string }
  const rows: Pageview[] = pageviews.data ?? []
  const inCurrent = (iso: string) => Date.parse(iso) >= from.getTime() && Date.parse(iso) <= to.getTime()

  const currentRows = rows.filter((row) => inCurrent(row.viewed_at))
  const previousRows = rows.filter((row) => !inCurrent(row.viewed_at))

  const sessionRows: { id: string; started_at: string }[] = sessions.data ?? []
  const currentSessions = sessionRows.filter((row) => inCurrent(row.started_at))
  const previousSessions = sessionRows.filter((row) => !inCurrent(row.started_at))

  const delta = (current: number, before: number) => {
    if (before === 0) return current === 0 ? 0 : 1
    return (current - before) / before
  }

  const aiRows: { total_tokens: number | null; status_code: number }[] = usage.data ?? []
  const settingsRow: AiRouterSettingsRow | null = settings.data
  const monthlyLimit = Number(settingsRow?.monthly_token_limit ?? 0)

  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)

  const { data: monthRows } = await client
    .from('ai_usage_logs')
    .select('total_tokens')
    .gte('created_at', monthStart.toISOString())

  const tokensUsed = ((monthRows ?? []) as { total_tokens: number | null }[]).reduce(
    (sum, row) => sum + Number(row.total_tokens ?? 0),
    0,
  )

  const distinctVisitors = (list: Pageview[]) => new Set(list.map((row) => row.visitor_id)).size

  return {
    range,
    from: from.toISOString(),
    to: to.toISOString(),
    visitors: distinctVisitors(currentRows),
    visitorsDelta: delta(distinctVisitors(currentRows), distinctVisitors(previousRows)),
    pageViews: currentRows.length,
    pageViewsDelta: delta(currentRows.length, previousRows.length),
    sessions: currentSessions.length,
    sessionsDelta: delta(currentSessions.length, previousSessions.length),
    totalVisitors: visitors.count ?? 0,
    blogPosts: postCount.count ?? 0,
    projects: projectCount.count ?? 0,
    aiRequests: aiRows.length,
    aiTokens: aiRows.reduce((sum, row) => sum + Number(row.total_tokens ?? 0), 0),
    aiErrors: aiRows.filter((row) => row.status_code >= 400).length,
    routerEnabled: settingsRow?.is_enabled === true,
    quota: {
      limit: monthlyLimit,
      used: tokensUsed,
      remaining: monthlyLimit > 0 ? Math.max(0, monthlyLimit - tokensUsed) : 0,
    },
  }
})
