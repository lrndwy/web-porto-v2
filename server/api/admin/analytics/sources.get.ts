export default defineEventHandler(async (event) =>
  withAnalyticsPeriod(event, async ({ client, from, to }) => {
    const { data } = await client
      .from('analytics_sessions')
      .select('referrer, visitor_id')
      .gte('started_at', from.toISOString())
      .lte('started_at', to.toISOString())

    const grouped = countBy(
      (data ?? []) as { referrer: string | null; visitor_id: string }[],
      (row) => {
        if (!row.referrer) return 'Direct'
        try {
          return new URL(row.referrer).hostname.replace(/^www\./, '')
        } catch {
          return 'Direct'
        }
      },
    )

    const total = grouped.reduce((sum, [, count]) => sum + count, 0)
    return grouped.map(([referrer, visitors]) => ({
      referrer,
      visitors,
      percentage: total === 0 ? 0 : visitors / total,
    }))
  }),
)
