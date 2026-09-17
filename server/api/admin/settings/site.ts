import { z } from 'zod'
import { untypedClient } from '~~/server/utils/resources'

const SITE_SELECT =
  'id, site_name, logo_url, favicon_url, meta_title, meta_description, og_image_url, maintenance_mode'

const siteSettingsSchema = z.object({
  site_name: z.string().trim().min(1).max(200),
  logo_url: z.string().trim().max(500).nullable().optional(),
  favicon_url: z.string().trim().max(500).nullable().optional(),
  meta_title: z.string().trim().max(200).nullable().optional(),
  meta_description: z.string().trim().max(500).nullable().optional(),
  og_image_url: z.string().trim().max(500).nullable().optional(),
  maintenance_mode: z.boolean(),
})

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const client = untypedClient(event)

  if (event.method === 'GET') {
    const { data, error } = await client
      .from('site_settings')
      .select(SITE_SELECT)
      .limit(1)
      .maybeSingle()
    if (error) throwDbError(error)
    return data
  }

  const parsed = siteSettingsSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'validation_failed',
      data: { issues: parsed.error.issues },
    })
  }

  const values = Object.fromEntries(
    Object.entries(parsed.data).map(([key, value]) => [key, value === '' ? null : value]),
  )

  const { data, error } = await client
    .from('site_settings')
    .update(values)
    .not('id', 'is', null)
    .select(SITE_SELECT)
    .single()

  if (error) throwDbError(error)
  return data
})
