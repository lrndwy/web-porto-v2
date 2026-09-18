import { untypedClient } from '~~/server/utils/resources'

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const def = getResource(getRouterParam(event, 'resource'))
  const parsed = def.insert.safeParse(await readBody(event))

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'validation_failed',
      data: { issues: parsed.error.issues },
    })
  }

  // The schema already proved this is an object; `ZodType` alone erases that.
  const validated: Record<string, unknown> = { ...(parsed.data as Record<string, unknown>) }
  const values: Record<string, unknown> = def.normalize ? def.normalize(validated) : validated
  const client = untypedClient(event)

  // Taxonomy tables require a unique slug; the form only asks for a name.
  if (def.slugFrom && values.slug === undefined) {
    const seed = String(values[def.slugFrom] ?? '')
    values.slug = await uniqueTableSlug(client, def.table, slugify(seed))
  }

  // New rows land at the end of the manual order.
  if (def.orderColumn && values[def.orderColumn] === undefined) {
    const { data: lastRow } = await client
      .from(def.table)
      .select(def.orderColumn)
      .order(def.orderColumn, { ascending: false })
      .limit(1)
      .maybeSingle()

    values[def.orderColumn] = (readNumber(lastRow, def.orderColumn) ?? -1) + 1
  }

  const { data, error } = await client.from(def.table).insert(values).select().single()
  if (error) throwDbError(error)

  setResponseStatus(event, 201)
  return data
})
