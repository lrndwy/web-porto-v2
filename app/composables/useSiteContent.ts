import type { NuxtApp } from '#app'

/**
 * Public reads go through the anon client, so every visibility rule is enforced
 * by RLS rather than by route code. No public read endpoints exist except the
 * signed-document one, which the anon client cannot serve.
 *
 * Each loader is a `useAsyncData` with a stable key and payload reuse, so the
 * `swr` route rules can serve a cached payload without a second query.
 */

function payloadCache(nuxtApp: NuxtApp, key: string) {
  return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
}

function loader<T>(key: string, fetcher: () => Promise<T>) {
  return useAsyncData<T>(key, fetcher, {
    getCachedData: (cacheKey) => payloadCache(useNuxtApp(), cacheKey) as T | undefined,
  })
}

export function useSiteSettings() {
  return loader('site-settings', async () => {
    const { data } = await useSupabaseClient()
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle()
    return data
  })
}

export function useNavigation() {
  return loader('navigation', async () => {
    const client = useSupabaseClient()
    const { data } = await client
      .from('navigation_items')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true })

    const items = data ?? []
    if (!items.some((item) => item.path === '/router')) return items

    // `ai_router_settings` has no anon policy, so the router state comes from
    // the one public endpoint that is allowed to expose it.
    const info = await $fetch<{ enabled: boolean }>('/api/router/info').catch(() => ({ enabled: false }))
    return info.enabled ? items : items.filter((item) => item.path !== '/router')
  })
}

export function useProfile() {
  return loader('profile', async () => {
    const { data } = await useSupabaseClient()
      .from('profiles')
      .select('*')
      .eq('is_visible', true)
      .limit(1)
      .maybeSingle()
    return data
  })
}

export function useExperiences() {
  return loader('experiences', async () => {
    const { data } = await useSupabaseClient()
      .from('experiences')
      .select('*')
      .eq('is_visible', true)
      .order('is_current', { ascending: false })
      .order('display_order', { ascending: true })
    return data ?? []
  })
}

export function useAchievements() {
  return loader('achievements', async () => {
    const { data } = await useSupabaseClient()
      .from('achievements')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true })
    return data ?? []
  })
}

export function useEducations() {
  return loader('educations', async () => {
    const { data } = await useSupabaseClient()
      .from('educations')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true })
    return data ?? []
  })
}

export function useSocials() {
  return loader('socials', async () => {
    const { data } = await useSupabaseClient()
      .from('socials')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true })
    return data ?? []
  })
}

export function useFeaturedProjects() {
  return loader('projects', async () => {
    const client = useSupabaseClient()
    const { data: settings } = await client
      .from('github_settings')
      .select('max_projects')
      .limit(1)
      .maybeSingle()

    const { data } = await client
      .from('github_repositories')
      .select('*')
      .eq('is_visible', true)
      .order('is_featured', { ascending: false })
      .order('pushed_at', { ascending: false })
      .limit(settings?.max_projects ?? 6)

    return data ?? []
  })
}

export function useArticles(limit = 3, page = 1, categorySlug?: string) {
  const key = `articles-${limit}-${page}-${categorySlug ?? 'all'}`
  return loader(key, async () => {
    const client = useSupabaseClient()
    let request = client
      .from('blog_posts')
      .select('*, blog_categories(name, slug)', { count: 'exact' })
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (categorySlug) request = request.eq('blog_categories.slug', categorySlug)

    const { data, count } = await request
    return { items: data ?? [], total: count ?? 0 }
  })
}

export function useArticle(slug: string) {
  return loader(`article-${slug}`, async () => {
    const { data } = await useSupabaseClient()
      .from('blog_posts')
      .select('*, blog_categories(name, slug)')
      .eq('slug', slug)
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .maybeSingle()
    return data
  })
}

export function useBlogCategories() {
  return loader('blog-categories', async () => {
    const { data } = await useSupabaseClient()
      .from('blog_categories')
      .select('*')
      .order('name', { ascending: true })
    return data ?? []
  })
}
