/** Daily (or weekly) visitors, page views, and sessions for the trend chart. */
export default defineEventHandler(async (event) =>
  withAnalyticsPeriod(event, async ({ client, from, to, range }) => {
    const granularity = stringParam(getQuery(event).granularity) === 'week' ? 'week' : 'day'
    const bucket = (iso: string) => {
      const date = new Date(iso)
      date.setUTCHours(0, 0, 0, 0)
      if (granularity === 'week') {
        // ISO weeks start on Monday.
        const day = (date.getUTCDay() + 6) % 7
        date.setUTCDate(date.getUTCDate() - day)
      }
      return date.toISOString().slice(0, 10)
    }

    const [pageviews, sessions] = await Promise.all([
      client
        .from('analytics_pageviews')
        .select('visitor_id, viewed_at')
        .gte('viewed_at', from.toISOString())
        .lte('viewed_at', to.toISOString()),
      client
        .from('analytics_sessions')
        .select('id, started_at')
        .gte('started_at', from.toISOString())
        .lte('started_at', to.toISOString()),
    ])

    const buckets = new Map<string, { visitors: Set<string>; pageviews: number; sessions: number }>()
    const ensure = (key: string) => {
      let entry = buckets.get(key)
      if (!entry) {
        entry = { visitors: new Set(), pageviews: 0, sessions: 0 }
        buckets.set(key, entry)
      }
      return entry
    }

    for (const row of (pageviews.data ?? []) as { visitor_id: string; viewed_at: string }[]) {
      const entry = ensure(bucket(row.viewed_at))
      entry.pageviews += 1
      entry.visitors.add(row.visitor_id)
    }
    for (const row of (sessions.data ?? []) as { started_at: string }[]) {
      ensure(bucket(row.started_at)).sessions += 1
    }

    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, entry]) => ({
        date,
        visitors: entry.visitors.size,
        pageviews: entry.pageviews,
        sessions: entry.sessions,
      }))
  }),
)
