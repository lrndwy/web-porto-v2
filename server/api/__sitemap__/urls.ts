import { untypedClient } from '~~/server/utils/resources'

const STATIC_ROUTES = [
  '/',
  '/about',
  '/experience',
  '/achievement',
  '/education',
  '/projects',
  '/blog',
  '/router',
  '/contact',
  '/cv',
  '/privacy',
]

/** Sitemap source. Projects have no detail page, so only posts are dynamic. */
export default defineEventHandler(async (event) => {
  const client = untypedClient(event)
  const config = useRuntimeConfig(event)
  const base = String(config.public.siteUrl || '').replace(/\/$/, '')

  const { data } = await client
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  const posts: { slug: string; updated_at: string }[] = data ?? []

  return [
    ...STATIC_ROUTES.map((route) => ({ loc: `${base}${route}` })),
    ...posts.map((post) => ({
      loc: `${base}/blog/${post.slug}`,
      lastmod: post.updated_at,
    })),
  ]
})
