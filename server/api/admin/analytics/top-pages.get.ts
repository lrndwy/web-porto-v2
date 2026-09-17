export default defineEventHandler(async (event) =>
  withAnalyticsPeriod(event, async ({ client, from, to }) => {
    const limit = clamp(intParam(getQuery(event).limit, 10), 1, 100)

    const { data } = await client
      .from('analytics_pageviews')
      .select('path, visitor_id')
      .gte('viewed_at', from.toISOString())
      .lte('viewed_at', to.toISOString())

    const rows: { path: string; visitor_id: string }[] = data ?? []
    const byPath = new Map<string, { views: number; visitors: Set<string> }>()

    for (const row of rows) {
      let entry = byPath.get(row.path)
      if (!entry) {
        entry = { views: 0, visitors: new Set() }
        byPath.set(row.path, entry)
      }
      entry.views += 1
      entry.visitors.add(row.visitor_id)
    }

    return [...byPath.entries()]
      .map(([path, entry]) => ({ path, views: entry.views, visitors: entry.visitors.size }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
  }),
)
