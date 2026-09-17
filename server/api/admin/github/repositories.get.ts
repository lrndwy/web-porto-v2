import { untypedClient } from '~~/server/utils/resources'

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const query = getQuery(event)
  const page = Math.max(1, intParam(query.page, 1))
  const pageSize = clamp(intParam(query.pageSize, 20), 1, 100)
  const term = escapeLikePattern(stringParam(query.q))
  const featured = stringParam(query.featured)
  const visible = stringParam(query.visible)

  const client = untypedClient(event)
  let request = client.from('github_repositories').select('*', { count: 'exact' })

  if (term) {
    request = request.or(
      ['name', 'full_name', 'description', 'language']
        .map((column) => `${column}.ilike.%${term}%`)
        .join(','),
    )
  }
  if (featured === 'true' || featured === 'false') request = request.eq('is_featured', featured === 'true')
  if (visible === 'true' || visible === 'false') request = request.eq('is_visible', visible === 'true')

  const from = (page - 1) * pageSize
  const { data, error, count } = await request
    .order('is_featured', { ascending: false })
    .order('pushed_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (error) throwDbError(error)

  return { items: data ?? [], total: count ?? 0, page, pageSize }
})
