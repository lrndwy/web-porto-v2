import type { SupabaseClient } from '@supabase/supabase-js'
import { blogTaxonomySchema } from '#shared/schemas/blog'
import { untypedClient } from '~~/server/utils/resources'

const TABLES = { category: 'blog_categories', tag: 'blog_tags' } as const

export default defineEventHandler(async (event) => {
  await requireOwner(event)

  const client: SupabaseClient = untypedClient(event)

  if (event.method === 'GET') {
    const [categories, tags, posts] = await Promise.all([
      client.from('blog_categories').select('*').order('name', { ascending: true }),
      client.from('blog_tags').select('*').order('name', { ascending: true }),
      client.from('blog_posts').select('category_id'),
    ])

    const byCategory = new Map<string, number>()
    for (const post of (posts.data ?? []) as { category_id: string | null }[]) {
      if (!post.category_id) continue
      byCategory.set(post.category_id, (byCategory.get(post.category_id) ?? 0) + 1)
    }

    const { data: postTags } = await client.from('blog_post_tags').select('tag_id')
    const byTag = new Map<string, number>()
    for (const link of (postTags ?? []) as { tag_id: string }[]) {
      byTag.set(link.tag_id, (byTag.get(link.tag_id) ?? 0) + 1)
    }

    return {
      categories: ((categories.data ?? []) as { id: string }[]).map((row) => ({
        ...row,
        post_count: byCategory.get(row.id) ?? 0,
      })),
      tags: ((tags.data ?? []) as { id: string }[]).map((row) => ({
        ...row,
        post_count: byTag.get(row.id) ?? 0,
      })),
    }
  }

  const parsed = blogTaxonomySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'validation_failed',
      data: { issues: parsed.error.issues },
    })
  }

  const table = TABLES[parsed.data.kind]
  const { data: existing } = await client.from(table).select('slug')
  const taken = ((existing ?? []) as { slug: string }[]).map((row) => row.slug)
  const slug = uniqueSlug(slugify(parsed.data.slug ?? parsed.data.name), taken)

  const values: Record<string, unknown> = { name: parsed.data.name, slug }
  if (parsed.data.kind === 'category') values.description = parsed.data.description ?? null

  const { data, error } = await client.from(table).insert(values).select().single()
  if (error) throwDbError(error)

  setResponseStatus(event, 201)
  return data
})
