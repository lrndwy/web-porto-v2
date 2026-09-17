export default defineEventHandler(async (event) =>
  withAnalyticsPeriod(event, async ({ client, from, to }) => {
    const { data } = await client
      .from('analytics_visitors')
      .select('country, last_seen_at')
      .gte('last_seen_at', from.toISOString())
      .lte('last_seen_at', to.toISOString())

    return countBy(
      (data ?? []) as { country: string | null }[],
      (row) => row.country ?? 'Unknown',
    ).map(([country, visitors]) => ({ country, visitors }))
  }),
)
