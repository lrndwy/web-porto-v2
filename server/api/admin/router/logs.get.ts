import { untypedClient } from '~~/server/utils/resources'

/** Dense, paginated request log. Prompt and response bodies are never stored. */
export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const query = getQuery(event)
  const page = Math.max(1, intParam(query.page, 1))
  const pageSize = clamp(intParam(query.pageSize, 50), 1, 200)
  const modelId = stringParam(query.model)
  const providerId = stringParam(query.provider)
  const status = intParam(query.status, 0)

  const client = untypedClient(event)
  let request = client
    .from('ai_usage_logs')
    .select('*, ai_models(display_name), ai_providers(name)', { count: 'exact' })

  if (modelId) request = request.eq('model_id', modelId)
  if (providerId) request = request.eq('provider_id', providerId)
  if (status) request = request.eq('status_code', status)

  const from = (page - 1) * pageSize
  const { data, error, count } = await request
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (error) throwDbError(error)

  // The log grows without bound; pageSize is small enough that rendering is
  // cheaper than list virtualisation. Virtualise if a month exceeds ~5k rows.
  return { items: data ?? [], total: count ?? 0, page, pageSize }
})
