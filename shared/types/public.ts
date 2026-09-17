/** Shapes returned by the public loaders, including their embedded joins. */

export interface ArticleSummary {
  id: string
  title: string
  slug: string
  excerpt: string | null
  thumbnail_url: string | null
  published_at: string | null
  meta_title?: string | null
  meta_description?: string | null
  content?: unknown
  blog_categories: { name: string; slug: string } | null
}

export interface RouterInfo {
  enabled: boolean
  endpoint: string
  /**
   * The working public key. Published by design; null when no complete key has
   * been issued yet, or when the active one predates storing the whole value.
   */
  key: string | null
  models: { display_name: string; provider_name: string }[]
  quota: { limit: number; used: number; remaining: number }
}

export interface PublicDocument {
  id: string
  name: string
  version: string | null
  file_type: string | null
  url: string | null
}
