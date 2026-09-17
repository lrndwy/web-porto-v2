import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Blog persistence helpers. All of them run on the service-role client, since
 * the admin routes have already established that the caller is the Owner.
 */

/** Slugs are unique site-wide; a collision gets `-2`, `-3`, … appended. */
export async function resolveUniqueSlug(
  client: SupabaseClient,
  candidate: string,
  ignoreId?: string,
): Promise<string> {
  let request = client.from('blog_posts').select('slug').ilike('slug', `${candidate}%`)
  if (ignoreId) request = request.neq('id', ignoreId)

  const { data } = await request
  const taken = ((data ?? []) as { slug: string }[]).map((row) => row.slug)
  return uniqueSlug(candidate, taken)
}

/** Replaces the post's tag links with exactly the supplied set. */
export async function replacePostTags(
  client: SupabaseClient,
  postId: string,
  tagIds: string[] | undefined,
): Promise<void> {
  if (tagIds === undefined) return

  await client.from('blog_post_tags').delete().eq('post_id', postId)
  if (!tagIds.length) return

  await client
    .from('blog_post_tags')
    .insert(tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId })))
}
