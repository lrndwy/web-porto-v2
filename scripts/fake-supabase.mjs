/**
 * A local stand-in for Supabase (PostgREST + a slice of Storage and Auth),
 * used to develop and verify the app without a hosted project.
 *
 * It is NOT part of the product: it exists so `pnpm dev` can render SSR pages
 * and the admin CRUD screens against realistic responses. Point the app at it
 * with:
 *
 *   NUXT_PUBLIC_SUPABASE_URL=http://localhost:54321
 *   NUXT_PUBLIC_SUPABASE_KEY=local-anon-key
 *   NUXT_SUPABASE_SECRET_KEY=local-service-key
 *
 * Run with: bun scripts/fake-supabase.mjs
 */

const PORT = Number(process.env.FAKE_SUPABASE_PORT ?? 54321)

let idCounter = 0
const uuid = () => {
  idCounter += 1
  return `00000000-0000-4000-8000-${String(idCounter).padStart(12, '0')}`
}
const now = () => new Date().toISOString()

const db = {
  user_profiles: [
    { id: '11111111-1111-4111-8111-111111111111', display_name: 'Hafiz Agha Al-Baith', role: 'OWNER', avatar_url: null, created_at: now(), updated_at: now() },
  ],
  site_settings: [
    { id: uuid(), site_name: 'Hafiz Agha Al-Baith', logo_url: null, favicon_url: null, meta_title: 'Hafiz Agha Al-Baith — Software Engineer & Founder', meta_description: 'Portfolio, writing, and a public AI router.', og_image_url: null, maintenance_mode: false, updated_at: now() },
  ],
  navigation_items: [
    { id: uuid(), label: 'Home', path: '/', icon: 'ph:house', display_order: 0, is_visible: true, is_external: false },
    { id: uuid(), label: 'About', path: '/about', icon: 'ph:user', display_order: 1, is_visible: true, is_external: false },
    { id: uuid(), label: 'Experience', path: '/experience', icon: 'ph:briefcase', display_order: 2, is_visible: true, is_external: false },
    { id: uuid(), label: 'Projects', path: '/projects', icon: 'ph:folders', display_order: 3, is_visible: true, is_external: false },
    { id: uuid(), label: 'Blog', path: '/blog', icon: 'ph:article', display_order: 4, is_visible: true, is_external: false },
    { id: uuid(), label: 'AI Router', path: '/router', icon: 'ph:sparkle', display_order: 5, is_visible: true, is_external: false },
    { id: uuid(), label: 'Contact', path: '/contact', icon: 'ph:envelope', display_order: 6, is_visible: true, is_external: false },
  ],
  profiles: [
    { id: uuid(), name: 'Hafiz Agha Al-Baith', title: 'Software Engineer & Founder', short_description: 'I build software, digital products, and systems that solve real problems.', description: 'I work across the stack — from Postgres schemas and API design to interfaces that stay out of the way.\n\nCurrently building tools for teams that ship.', avatar_url: null, location: 'Jakarta, Indonesia', email: 'hello@example.com', phone: null, github_username: 'hafiz', website_url: null, is_visible: true, created_at: now(), updated_at: now() },
  ],
  experiences: [
    { id: uuid(), title: 'Senior Software Engineer', organization: 'Northwind Systems', description: 'Led the platform team through a Postgres migration and a move to edge rendering.', location: 'Jakarta, Indonesia', start_date: '2024-02-01', end_date: null, is_current: true, logo_url: null, display_order: 0, is_visible: true, created_at: now(), updated_at: now() },
    { id: uuid(), title: 'Software Engineer', organization: 'Globex', description: 'Built internal tooling and the first version of the public API.', location: 'Remote', start_date: '2022-01-01', end_date: '2024-01-31', is_current: false, logo_url: null, display_order: 1, is_visible: true, created_at: now(), updated_at: now() },
    { id: uuid(), title: 'Junior Developer', organization: 'Initech', description: null, location: null, start_date: '2021-01-01', end_date: '2021-12-31', is_current: false, logo_url: null, display_order: 2, is_visible: false, created_at: now(), updated_at: now() },
  ],
  achievements: [
    { id: uuid(), title: 'Best Engineering Project', issuer: 'National Tech Awards', description: null, achievement_date: '2025-11-20', certificate_url: 'https://example.com/cert.pdf', image_url: null, display_order: 0, is_visible: true, created_at: now(), updated_at: now() },
  ],
  educations: [
    { id: uuid(), institution: 'Universitas Indonesia', degree: 'Bachelor of Computer Science', field: 'Software Engineering', description: null, start_date: '2020-08-01', end_date: '2024-07-31', logo_url: null, display_order: 0, is_visible: true, created_at: now(), updated_at: now() },
  ],
  socials: [
    { id: uuid(), platform: 'GitHub', username: 'hafiz', url: 'https://github.com/hafiz', icon: 'ph:github-logo', display_order: 0, is_visible: true, created_at: now(), updated_at: now() },
    { id: uuid(), platform: 'LinkedIn', username: 'hafiz', url: 'https://linkedin.com/in/hafiz', icon: 'ph:linkedin-logo', display_order: 1, is_visible: true, created_at: now(), updated_at: now() },
  ],
  documents: [
    { id: uuid(), name: 'Curriculum Vitae', file_path: 'cv/2026.pdf', file_type: 'application/pdf', file_size: 182000, version: '2026', is_active: true, is_visible: true, created_at: now(), updated_at: now() },
  ],
  github_settings: [
    { id: uuid(), username: 'hafiz', max_projects: 6, auto_sync: false, last_synced_at: null, created_at: now(), updated_at: now() },
  ],
  github_repositories: [
    { id: uuid(), github_id: 9001, name: 'atlas-router', full_name: 'hafiz/atlas-router', description: 'A small gateway that fronts several model providers behind one OpenAI-compatible endpoint.', html_url: 'https://github.com/hafiz/atlas-router', homepage_url: 'https://atlas.example.com', language: 'TypeScript', stars: 412, forks: 38, pushed_at: '2026-08-30T10:00:00Z', is_featured: true, is_visible: true, display_order: 0, synced_at: now() },
    { id: uuid(), github_id: 9002, name: 'ledger-ts', full_name: 'hafiz/ledger-ts', description: 'Double-entry accounting primitives with a typed schema.', html_url: 'https://github.com/hafiz/ledger-ts', homepage_url: null, language: 'TypeScript', stars: 96, forks: 12, pushed_at: '2026-07-14T10:00:00Z', is_featured: false, is_visible: true, display_order: 1, synced_at: now() },
    { id: uuid(), github_id: 9003, name: 'pg-migrations', full_name: 'hafiz/pg-migrations', description: 'Opinionated Postgres migrations for small teams.', html_url: 'https://github.com/hafiz/pg-migrations', homepage_url: null, language: 'Go', stars: 54, forks: 5, pushed_at: '2026-05-02T10:00:00Z', is_featured: false, is_visible: false, display_order: 2, synced_at: now() },
  ],
  blog_categories: [
    { id: 'dddddddd-0000-4000-8000-000000000001', name: 'Notes', slug: 'notes', description: 'Short-form engineering notes.', created_at: now() },
    { id: 'dddddddd-0000-4000-8000-000000000002', name: 'Engineering', slug: 'engineering', description: null, created_at: now() },
  ],
  blog_tags: [{ id: 'eeeeeeee-0000-4000-8000-000000000001', name: 'postgres', slug: 'postgres', created_at: now() }],
  blog_posts: [
    { id: 'aaaaaaaa-0000-4000-8000-000000000001', author_id: '11111111-1111-4111-8111-111111111111', category_id: 'dddddddd-0000-4000-8000-000000000001', title: 'Designing for a single accent colour', slug: 'designing-for-a-single-accent-colour', excerpt: 'Constraint is what makes an interface legible. Here is how one accent colour carries an entire product.', content: null, thumbnail_url: null, status: 'published', published_at: '2026-08-12T09:00:00Z', meta_title: null, meta_description: null, created_at: now(), updated_at: now() },
    { id: 'aaaaaaaa-0000-4000-8000-000000000002', author_id: '11111111-1111-4111-8111-111111111111', category_id: 'dddddddd-0000-4000-8000-000000000002', title: 'Postgres as a rate limiter', slug: 'postgres-as-a-rate-limiter', excerpt: 'A single atomic statement is enough to run fixed-window limits without Redis.', content: null, thumbnail_url: null, status: 'published', published_at: '2026-06-02T09:00:00Z', meta_title: null, meta_description: null, created_at: now(), updated_at: now() },
    { id: 'aaaaaaaa-0000-4000-8000-000000000003', author_id: null, category_id: null, title: 'Draft: on writing more', slug: 'draft-on-writing-more', excerpt: null, content: null, thumbnail_url: null, status: 'draft', published_at: null, meta_title: null, meta_description: null, created_at: now(), updated_at: now() },
  ],
  blog_post_tags: [],
  ai_router_settings: [
    { id: uuid(), is_enabled: true, monthly_token_limit: 100000, requests_per_minute: 10, requests_per_hour: 120, requests_per_day: 1000, quota_exceeded_message: 'Monthly token quota exhausted. Try again next month.', created_at: now(), updated_at: now() },
  ],
  ai_providers: [
    { id: 'bbbbbbbb-0000-4000-8000-000000000001', name: 'OpenAI', base_url: 'https://api.openai.com/v1', secret_api_key: 'sk-not-a-real-key', is_active: true, created_at: now(), updated_at: now() },
  ],
  ai_models: [
    { id: 'cccccccc-0000-4000-8000-000000000001', provider_id: 'bbbbbbbb-0000-4000-8000-000000000001', model_name: 'gpt-4o-mini', display_name: 'gpt-4o-mini', input_price: 0.15, output_price: 0.6, is_active: true, created_at: now(), updated_at: now() },
  ],
  ai_api_keys: [
    { id: uuid(), key_prefix: 'pk_portfolio_7f3a9c', key_hash: 'stub-hash', label: 'Default', is_active: true, last_used_at: '2026-09-17T20:00:00Z', created_at: now(), revoked_at: null },
  ],
  ai_usage_logs: [
    { id: uuid(), api_key_id: null, provider_id: 'bbbbbbbb-0000-4000-8000-000000000001', model_id: 'cccccccc-0000-4000-8000-000000000001', request_id: 'req-1', input_tokens: 120, output_tokens: 80, total_tokens: 200, status_code: 200, latency_ms: 840, error_code: null, created_at: now() },
  ],
  ai_rate_limits: [],
  analytics_visitors: [],
  analytics_sessions: [],
  analytics_pageviews: [],
  analytics_events: [],
}

// PostgREST returns an embedded object for a many-to-one foreign key.
const RELATIONS = {
  blog_posts: { blog_categories: { column: 'category_id', table: 'blog_categories' } },
  blog_post_tags: { blog_tags: { column: 'tag_id', table: 'blog_tags' } },
}

function applyFilters(rows, params) {
  let out = rows
  for (const [key, raw] of params) {
    if (['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].includes(key)) continue

    if (key === 'or') {
      const clauses = raw.replace(/^\(|\)$/g, '').split(',').filter(Boolean)
      out = out.filter((row) =>
        clauses.some((clause) => {
          const [column, op, ...rest] = clause.split('.')
          const value = rest.join('.')
          return op === 'ilike' ? String(row[column] ?? '').toLowerCase().includes(value.replaceAll('%', '').toLowerCase()) : false
        }),
      )
      continue
    }

    const [op, ...rest] = raw.split('.')
    const value = rest.join('.')
    out = out.filter((row) => {
      const cell = row[key]
      switch (op) {
        case 'eq': return String(cell) === value
        case 'neq': return String(cell) !== value
        case 'is': return value === 'null' ? cell === null || cell === undefined : String(cell) === value
        case 'gte': return cell !== null && cell >= value
        case 'lte': return cell !== null && cell <= value
        case 'gt': return cell !== null && cell > value
        case 'lt': return cell !== null && cell < value
        case 'in': return value.replace(/^\(|\)$/g, '').split(',').map((v) => v.replaceAll('"', '')).includes(String(cell))
        case 'ilike': return String(cell ?? '').toLowerCase().includes(value.replaceAll('%', '').toLowerCase())
        default: return true
      }
    })
  }
  return out
}

function applyOrder(rows, order) {
  if (!order) return rows
  const [column, direction] = order.split('.')
  const sign = direction === 'desc' ? -1 : 1
  return [...rows].sort((a, b) => {
    const left = a[column]
    const right = b[column]
    if (left === right) return 0
    if (left === null || left === undefined) return 1
    if (right === null || right === undefined) return -1
    return left > right ? sign : -sign
  })
}

function project(rows, select) {
  const embeds = [...String(select ?? '*').matchAll(/(\w+)\(([^)]*)\)/g)]
  if (!embeds.length) return rows

  return rows.map((row) => {
    const copy = { ...row }
    for (const [full, table, columns] of embeds) {
      const relation = RELATIONS[table]?.[full]
      if (!relation) continue
      const target = (db[relation.table] ?? []).find((candidate) => candidate.id === row[relation.column])
      if (!target) {
        copy[full] = null
        continue
      }
      const picked = {}
      for (const column of columns.split(',').map((c) => c.trim()).filter(Boolean)) picked[column] = target[column]
      copy[full] = picked
    }
    return copy
  })
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'access-control-expose-headers': 'content-range', ...headers },
  })
}

Bun.serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': '*',
          'access-control-allow-methods': '*',
        },
      })
    }

    // Storage: upload, signed URL, and public URL all succeed locally.
    if (url.pathname.startsWith('/storage/v1/')) {
      if (url.pathname.endsWith('/sign')) {
        return json({ signedURL: '/fake-storage/signed.pdf?token=stub' })
      }
      if (url.pathname.includes('/object/')) {
        return json({ Key: url.pathname })
      }
      return json({})
    }

    if (url.pathname.startsWith('/auth/v1/')) {
      if (url.pathname.endsWith('/token') || url.pathname.endsWith('/user')) {
        return json({
          access_token: 'stub',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'stub',
          user: { id: '11111111-1111-4111-8111-111111111111', email: 'owner@example.com' },
        })
      }
      return json({})
    }

    if (!url.pathname.startsWith('/rest/v1/')) {
      return json({ message: 'not found' }, 404)
    }

    const table = url.pathname.replace('/rest/v1/', '')
    const rows = db[table]
    if (!rows) return json({ message: `unknown table ${table}` }, 404)

    const params = [...url.searchParams.entries()]
    const single = (request.headers.get('accept') ?? '').includes('pgrst.object')
    const wantsCount = (request.headers.get('prefer') ?? '').includes('count=exact')
    const isInsert = request.method === 'POST'
    const isUpdate = request.method === 'PATCH'
    const isDelete = request.method === 'DELETE'

    if (isInsert) {
      const body = await request.json()
      const incoming = Array.isArray(body) ? body : [body]
      const created = incoming.map((row) => ({ id: row.id ?? uuid(), created_at: now(), updated_at: now(), ...row }))
      rows.push(...created)
      if (single) return json(created[0], 201)
      return json(created, 201)
    }

    let matched = applyFilters(rows, params)

    if (isUpdate) {
      const body = await request.json()
      for (const row of matched) {
        Object.assign(row, body, { updated_at: now() })
      }
      return json(single ? (matched[0] ?? null) : matched)
    }

    if (isDelete) {
      const removed = matched.map((row) => row.id)
      for (const id of removed) rows.splice(rows.findIndex((row) => row.id === id), 1)
      return json(single ? null : [])
    }

    const total = matched.length
    matched = applyOrder(matched, url.searchParams.get('order'))
    matched = project(matched, url.searchParams.get('select'))

    const rangeHeader = request.headers.get('range')
    if (rangeHeader) {
      const [start, end] = rangeHeader.replace('bytes=', '').split('-').map(Number)
      const offset = url.searchParams.get('offset')
      const limit = url.searchParams.get('limit')
      const from = Number.isFinite(start) ? start : Number(offset ?? 0)
      const to = Number.isFinite(end) ? end : limit ? from + Number(limit) - 1 : matched.length
      matched = matched.slice(from, to + 1)
    } else {
      const limit = url.searchParams.get('limit')
      if (limit) matched = matched.slice(0, Number(limit))
    }

    if (single) {
      if (!matched.length) {
        return json(
          { message: 'JSON object requested, multiple (or no) rows returned' },
          406,
          { 'content-range': `*/${total}` },
        )
      }
      return json(matched[0], 200, { 'content-range': `0-0/${total}` })
    }

    const headers = wantsCount ? { 'content-range': `${total ? 0 : 0}-${Math.max(0, matched.length - 1)}/${total}` } : {}
    return json(matched, 200, headers)
  },
})

console.log(`fake supabase listening on http://localhost:${PORT}`)
