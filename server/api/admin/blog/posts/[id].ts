import { z } from 'zod'
import { blogPostUpdateSchema } from '#shared/schemas/blog'
import { untypedClient } from '~~/server/utils/resources'

const SELECT = '*, blog_categories(name, slug), blog_post_tags(tag_id, blog_tags(name, slug))'

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const id = z.uuid().safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw createError({ statusCode: 400, statusMessage: 'invalid_id' })

  const client = untypedClient(event)

  if (event.method === 'GET') {
    const { data, error } = await client
      .from('blog_posts')
      .select(SELECT)
      .eq('id', id.data)
      .maybeSingle()

    if (error) throwDbError(error)
    if (!data) throw createError({ statusCode: 404, statusMessage: 'not_found' })
    return data
  }

  if (event.method === 'DELETE') {
    const { data, error } = await client
      .from('blog_posts')
      .delete()
      .eq('id', id.data)
      .select('id')
      .maybeSingle()

    if (error) throwDbError(error)
    if (!data) throw createError({ statusCode: 404, statusMessage: 'not_found' })
    return { ok: true, id: id.data }
  }

  const parsed = blogPostUpdateSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'validation_failed',
      data: { issues: parsed.error.issues },
    })
  }

  const { tag_ids, ...fields } = parsed.data

  // Re-run the publish transition: publishing without an excerpt stays refused,
  // and a newly published article gets its timestamp now.
  if (fields.status === 'published') {
    const { data: current } = await client
      .from('blog_posts')
      .select('excerpt, published_at, status')
      .eq('id', id.data)
      .maybeSingle()

    const excerpt = fields.excerpt ?? (current as { excerpt?: string | null } | null)?.excerpt
    if (!excerpt) {
      throw createError({ statusCode: 422, statusMessage: 'excerpt_required_to_publish' })
    }

    const existingPublishedAt =
      (current as { published_at?: string | null } | null)?.published_at ?? null
    fields.published_at = fields.published_at ?? existingPublishedAt ?? new Date().toISOString()
  }

  if (fields.title && !fields.slug) {
    fields.slug = await resolveUniqueSlug(client, slugify(fields.title), id.data)
  }

  const { data, error } = await client
    .from('blog_posts')
    .update(fields)
    .eq('id', id.data)
    .select(SELECT)
    .maybeSingle()

  if (error) throwDbError(error)
  if (!data) throw createError({ statusCode: 404, statusMessage: 'not_found' })

  await replacePostTags(client, id.data, tag_ids)
  return data
})
