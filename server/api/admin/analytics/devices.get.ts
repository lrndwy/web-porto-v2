export default defineEventHandler(async (event) =>
  withAnalyticsPeriod(event, async ({ client, from, to }) => {
    const { data } = await client
      .from('analytics_visitors')
      .select('device_type, browser, os, last_seen_at')
      .gte('last_seen_at', from.toISOString())
      .lte('last_seen_at', to.toISOString())

    const rows = (data ?? []) as {
      device_type: string | null
      browser: string | null
      os: string | null
    }[]

    const asRecord = (entries: [string, number][]) => Object.fromEntries(entries)

    return {
      device_type: asRecord(countBy(rows, (row) => row.device_type ?? 'unknown')),
      browser: asRecord(countBy(rows, (row) => row.browser ?? 'other')),
      os: asRecord(countBy(rows, (row) => row.os ?? 'other')),
    }
  }),
)
