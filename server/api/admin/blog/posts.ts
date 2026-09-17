import { blogPostSchema } from '#shared/schemas/blog'
import { untypedClient } from '~~/server/utils/resources'

const SELECT = '*, blog_categories(name, slug), blog_post_tags(tag_id, blog_tags(name, slug))'

export default defineEventHandler(async (event) => {
  const owner = await requireOwner(event)

  const client = untypedClient(event)
  const query = getQuery(event)

  if (event.method === 'GET') {
    const page = Math.max(1, intParam(query.page, 1))
    const pageSize = clamp(intParam(query.pageSize, 20), 1, 100)
    const term = escapeLikePattern(stringParam(query.q))
    const status = stringParam(query.status)
    const category = stringParam(query.category)

    let request = client.from('blog_posts').select(SELECT, { count: 'exact' })
    if (term) request = request.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`)
    if (['draft', 'published', 'archived'].includes(status)) request = request.eq('status', status)
    if (category) request = request.eq('category_id', category)

    const from = (page - 1) * pageSize
    const { data, error, count } = await request
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1)

    if (error) throwDbError(error)
    return { items: data ?? [], total: count ?? 0, page, pageSize }
  }

  const parsed = blogPostSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'validation_failed',
      data: { issues: parsed.error.issues },
    })
  }

  const { tag_ids, ...fields } = parsed.data

  const slug = await resolveUniqueSlug(client, fields.slug ?? slugify(fields.title))
  const publishedAt =
    fields.status === 'published' ? (fields.published_at ?? new Date().toISOString()) : fields.published_at

  const { data, error } = await client
    .from('blog_posts')
    .insert({
      ...fields,
      slug,
      published_at: publishedAt ?? null,
      author_id: owner.userId,
    })
    .select(SELECT)
    .single()

  if (error) throwDbError(error)
  await replacePostTags(client, data.id, tag_ids)

  setResponseStatus(event, 201)
  return data
})
