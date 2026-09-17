import { z } from 'zod'
import { untypedClient } from '~~/server/utils/resources'

const reorderSchema = z.object({ ids: z.array(z.uuid()).min(1).max(200) })

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const def = getResource(getRouterParam(event, 'resource'))
  if (!def.orderColumn) {
    throw createError({ statusCode: 400, statusMessage: 'resource_not_orderable' })
  }

  const parsed = reorderSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'validation_failed',
      data: { issues: parsed.error.issues },
    })
  }

  const orderColumn = def.orderColumn
  const client = untypedClient(event)

  type UpdateResult = { error: { code?: string; message: string } | null }

  // Cardinality is single-digit per resource, so an RPC would be more
  // machinery than the problem needs.
  const results: UpdateResult[] = await Promise.all(
    parsed.data.ids.map((id, index) =>
      client.from(def.table).update({ [orderColumn]: index }).eq('id', id),
    ),
  )

  const failure = results.find((result) => result.error)
  if (failure?.error) throwDbError(failure.error)

  return { ok: true, ids: parsed.data.ids }
})
