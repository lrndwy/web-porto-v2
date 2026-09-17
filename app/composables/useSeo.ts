interface SeoInput {
  title?: string
  description?: string
  image?: string | null
  type?: 'website' | 'article'
}

/**
 * Per-page metadata with the Owner's site defaults as the fallback, so a page
 * only states what differs.
 */
export function useSeo(input: SeoInput = {}) {
  const { data: settings } = useSiteSettings()
  const config = useRuntimeConfig()
  // Captured during setup: unhead resolves these computeds lazily, where
  // `useRoute()` would no longer have a Nuxt instance to read.
  const route = useRoute()

  const siteName = computed(() => settings.value?.site_name ?? '')
  const description = computed(
    () => input.description ?? settings.value?.meta_description ?? undefined,
  )
  const image = computed(() => input.image ?? settings.value?.og_image_url ?? undefined)
  const canonical = computed(() => {
    const base = String(config.public.siteUrl || '').replace(/\/$/, '')
    return base ? `${base}${route.fullPath}` : route.fullPath
  })

  // Composed explicitly rather than with a titleTemplate: the site's own
  // meta_title already contains the site name, so a template would double it.
  const title = computed(() => {
    if (input.title) return `${input.title} — ${siteName.value}`
    return settings.value?.meta_title || siteName.value
  })

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogType: input.type ?? 'website',
    ogSiteName: siteName,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
  })

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
  })
}
