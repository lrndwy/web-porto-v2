/** Usage KPIs for the router usage page. */
export default defineEventHandler(async (event) =>
  withAnalyticsPeriod(event, async ({ client, from, to }) => {
    const query = getQuery(event)
    const providerId = stringParam(query.provider)
    const modelId = stringParam(query.model)
    const status = intParam(query.status, 0)

    const startOfToday = new Date()
    startOfToday.setUTCHours(0, 0, 0, 0)

    const monthStart = new Date()
    monthStart.setUTCDate(1)
    monthStart.setUTCHours(0, 0, 0, 0)

    let request = client
      .from('ai_usage_logs')
      .select('*')
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString())

    if (providerId) request = request.eq('provider_id', providerId)
    if (modelId) request = request.eq('model_id', modelId)
    if (status) request = request.eq('status_code', status)

    const [{ data }, { count: todayCount }, { count: monthCount }] = await Promise.all([
      request,
      client
        .from('ai_usage_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfToday.toISOString()),
      client
        .from('ai_usage_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString()),
    ])

    const rows: AiUsageLogRow[] = data ?? []
    const totalTokens = rows.reduce((sum, row) => sum + Number(row.total_tokens ?? 0), 0)
    const errors = rows.filter((row) => row.status_code >= 400).length
    const latencies = rows.map((row) => row.latency_ms ?? 0).filter((value) => value > 0)

    const byModel = countBy(
      rows,
      (row) => row.model_id,
    )

    return {
      requestsToday: todayCount ?? 0,
      requestsThisMonth: monthCount ?? 0,
      requests: rows.length,
      inputTokens: rows.reduce((sum, row) => sum + Number(row.input_tokens ?? 0), 0),
      outputTokens: rows.reduce((sum, row) => sum + Number(row.output_tokens ?? 0), 0),
      totalTokens,
      averageLatency: latencies.length
        ? Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length)
        : 0,
      errorRate: rows.length === 0 ? 0 : errors / rows.length,
      topModels: byModel.slice(0, 5).map(([id, count]) => ({ model_id: id, count })),
    }
  }),
)
