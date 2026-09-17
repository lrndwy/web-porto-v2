import { untypedClient } from '~~/server/utils/resources'

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const def = getResource(getRouterParam(event, 'resource'))
  const query = getQuery(event)

  const page = Math.max(1, intParam(query.page, 1))
  const pageSize = clamp(intParam(query.pageSize, 20), 1, 100)

  const client = untypedClient(event)
  let request = client.from(def.table).select('*', { count: 'exact' })

  const term = escapeLikePattern(stringParam(query.q))
  if (term && def.searchColumns?.length) {
    request = request.or(def.searchColumns.map((column) => `${column}.ilike.%${term}%`).join(','))
  }

  const requestedSort = stringParam(query.sort)
  const orderColumn = sortColumnsFor(def).includes(requestedSort)
    ? requestedSort
    : def.defaultOrder.column
  const direction = stringParam(query.dir)
  const ascending = direction
    ? direction !== 'desc'
    : orderColumn === def.defaultOrder.column
      ? def.defaultOrder.ascending
      : false

  const from = (page - 1) * pageSize
  const { data, error, count } = await request
    .order(orderColumn, { ascending })
    .range(from, from + pageSize - 1)

  if (error) throwDbError(error)

  return { items: data ?? [], total: count ?? 0, page, pageSize }
})
