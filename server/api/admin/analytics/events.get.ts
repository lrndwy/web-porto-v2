export default defineEventHandler(async (event) =>
  withAnalyticsPeriod(event, async ({ client, from, to }) => {
    const { data } = await client
      .from('analytics_events')
      .select('event_name')
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString())

    return countBy(
      (data ?? []) as { event_name: string }[],
      (row) => row.event_name,
    ).map(([event_name, count]) => ({ event_name, count }))
  }),
)
