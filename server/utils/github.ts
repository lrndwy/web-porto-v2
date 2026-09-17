import { serverSupabaseServiceRole } from '#supabase/server'

const GITHUB_API = 'https://api.github.com'
/** 300 repositories is a sane ceiling; raise it if an account exceeds it. */
const MAX_PAGES = 3
const PER_PAGE = 100

interface GithubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  pushed_at: string | null
  fork: boolean
  archived: boolean
}

export interface SyncResult {
  synced: number
  created: number
  updated: number
  last_synced_at: string
}

function nextPageUrl(linkHeader: string | null): string | null {
  if (!linkHeader) return null
  const match = linkHeader.split(',').find((part) => part.includes('rel="next"'))
  return match?.match(/<([^>]+)>/)?.[1] ?? null
}

async function fetchRepositories(username: string, token?: string): Promise<GithubRepo[]> {
  const headers: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'user-agent': 'portfolio-platform',
  }
  if (token) headers.authorization = `Bearer ${token}`

  const repositories: GithubRepo[] = []
  let url: string | null =
    `${GITHUB_API}/users/${encodeURIComponent(username)}/repos` +
    `?sort=pushed&direction=desc&per_page=${PER_PAGE}&type=owner`

  for (let page = 0; page < MAX_PAGES && url; page += 1) {
    const response = await fetch(url, { headers })
    if (!response.ok) {
      throw createError({
        statusCode: response.status === 404 ? 404 : 502,
        statusMessage: response.status === 404 ? 'github_user_not_found' : 'github_unavailable',
      })
    }

    const batch = (await response.json()) as GithubRepo[]
    repositories.push(...batch)
    url = nextPageUrl(response.headers.get('link'))
  }

  // Forks and archived repositories add noise to a portfolio and the card
  // design has no field to explain them.
  return repositories.filter((repo) => !repo.fork && !repo.archived)
}

/**
 * Mirrors a GitHub account into `github_repositories`.
 *
 * `is_featured`, `is_visible`, and `display_order` on existing rows are Owner
 * decisions and are never overwritten; only synced metadata is refreshed. New
 * rows get an initial visibility based on the account's `max_projects`.
 */
export async function syncRepositories(
  event: Parameters<typeof serverSupabaseServiceRole>[0],
  username: string,
  token?: string,
): Promise<SyncResult> {
  const client: any = serverSupabaseServiceRole(event)
  const repositories = await fetchRepositories(username, token)

  const { data: existingRows, error: existingError } = await client
    .from('github_repositories')
    .select('github_id')

  if (existingError) {
    throw createError({ statusCode: 500, statusMessage: existingError.message })
  }

  const existingIds = new Set<number>(
    ((existingRows ?? []) as { github_id: number }[]).map((row) => row.github_id),
  )
  const incomingIds = new Set(repositories.map((repo) => repo.id))

  const metadata = (repo: GithubRepo) => ({
    github_id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    html_url: repo.html_url,
    homepage_url: repo.homepage,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    pushed_at: repo.pushed_at,
    synced_at: new Date().toISOString(),
  })

  // Existing rows are upserted without the Owner-controlled columns, so a sync
  // refreshes metadata and leaves curation alone.
  const existing = repositories.filter((repo) => existingIds.has(repo.id))
  if (existing.length) {
    const { error } = await client
      .from('github_repositories')
      .upsert(existing.map(metadata), { onConflict: 'github_id' })
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  }

  // Newly discovered rows get their initial order and visibility in the same
  // payload, because an upsert must satisfy every NOT NULL column to insert.
  const created = repositories.filter((repo) => !existingIds.has(repo.id))
  if (created.length) {
    const { data: settings } = await client
      .from('github_settings')
      .select('max_projects')
      .limit(1)
      .maybeSingle()
    const maxProjects = Number((settings as { max_projects?: number } | null)?.max_projects ?? 6)

    const initial = created
      .slice()
      .sort((a, b) => (b.pushed_at ?? '').localeCompare(a.pushed_at ?? ''))
      .map((repo, index) => ({
        ...metadata(repo),
        display_order: index,
        is_visible: index < maxProjects,
      }))

    const { error } = await client
      .from('github_repositories')
      .upsert(initial, { onConflict: 'github_id' })
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const lastSyncedAt = new Date().toISOString()
  await client
    .from('github_settings')
    .update({ last_synced_at: lastSyncedAt })
    .not('id', 'is', null)

  // Rows that disappeared upstream are hidden rather than deleted, so an
  // accidental sync against the wrong account cannot destroy curation.
  const staleIds = [...existingIds].filter((id) => !incomingIds.has(id))
  if (staleIds.length) {
    await client
      .from('github_repositories')
      .update({ is_visible: false })
      .in('github_id', staleIds)
  }

  return {
    synced: repositories.length,
    created: created.length,
    updated: repositories.length - created.length,
    last_synced_at: lastSyncedAt,
  }
}
