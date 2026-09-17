import { z } from 'zod'
import { untypedClient } from '~~/server/utils/resources'

/** Only the Owner-controlled columns are patchable; the rest come from GitHub. */
const patchSchema = z
  .object({
    is_featured: z.boolean().optional(),
    is_visible: z.boolean().optional(),
    display_order: z.number().int().min(0).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: 'Nothing to update' })

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const id = z.uuid().safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw createError({ statusCode: 400, statusMessage: 'invalid_id' })

  const parsed = patchSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'validation_failed',
      data: { issues: parsed.error.issues },
    })
  }

  const { data, error } = await untypedClient(event)
    .from('github_repositories')
    .update(parsed.data)
    .eq('id', id.data)
    .select()
    .maybeSingle()

  if (error) throwDbError(error)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'not_found' })

  return data
})
