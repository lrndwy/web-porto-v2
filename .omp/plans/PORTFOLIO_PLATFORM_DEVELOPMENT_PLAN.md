# Development Plan — Personal Developer Portfolio Platform

## Context

Build the platform specified by `docs/PRD.md` and `docs/MVP.md` from an empty repository (only `docs/` exists; no git, no `package.json`). Two surfaces: a **public portfolio** (`/`, `/about`, `/experience`, `/achievement`, `/education`, `/projects`, `/blog`, `/blog/[slug]`, `/router`, `/contact`, `/cv`) and a **private Owner dashboard** (`/admin/**`) that owns every piece of content, GitHub cached repositories, a multi-provider public AI Router, and privacy-safe visitor analytics. Deploy target is Vercel with Supabase (Postgres + Auth + Storage) as the backend.

The end state is a running `pnpm dev` where the Owner can log in, manage all content without touching source, and a public visitor sees a rendered portfolio whose data comes from Supabase. Every acceptance criterion in `docs/MVP.md` §6 must pass.

## Locked decisions

Chosen by the user before this plan was written. Each is binding.

| Area | Decision | Why |
|---|---|---|
| Framework | **Nuxt 4** (`nuxt@^4.5.2`), `app/` srcDir, `server/` at root | `docs/PRD.md` §11 mandates Nuxt; PRD/MVP are explicit and win over the design skill's React default |
| UI kit | **shadcn-vue** via `shadcn-nuxt` module + **Tailwind CSS v4** (`@tailwindcss/vite`) | `docs/PRD.md` §11; Tailwind v4 is the only version shadcn-vue 2.x targets |
| Motion | **motion-v** (`motion-v@^2.4.4`, official Motion for Vue) | User choice; React-only guidance in the design skill is adapted, not copied |
| Charts | **@unovis/vue** + **@unovis/ts** (`^1.7.0`) | User choice |
| Theme | **Light-first**, dark mode toggle, off-black dark surface (never `#000`) | `docs/*_DESIGN.md` require dark mode; light default reads more "mature/confident" |
| Package manager | **pnpm** | Deterministic lockfile, Vercel auto-detects |
| Icons | **Phosphor only** — `@nuxt/icon` + `@iconify-json/ph` for authored icons, `@phosphor-icons/vue` for shadcn internals | Design skill bans emoji and requires one icon language; DB-driven icons need dynamic names, which only `@nuxt/icon` provides |
| Fonts | **Geist** + **Geist Mono** via `@nuxt/fonts` (self-hosted at build) | Design skill bans `Inter`; Geist is on Google Fonts (verified reachable) and self-hosts |

**Effective design-skill dials** (skill baseline is 8/6/4; `docs/WEB_PORTOFOLIO_DESIGN.md` §2 and §23 and `docs/DASHBOARD_DESIGN.md` §2.3 explicitly forbid heavy motion, particles, 3D, video, gradients, and scroll-jacking, so the skill's own "ALWAYS listen to the user / docs" rule applies):

- `DESIGN_VARIANCE = 7` public, `5` admin
- `MOTION_INTENSITY = 4` (motion-v entrance reveals, spring-physics interactive states, shared-element `layoutId`; no scroll-jacking, no parallax, no canvas)
- `VISUAL_DENSITY = 5` public, `4` admin

## Design system contract

Implement once, in Phase 2. Every later phase consumes it; none may invent new tokens.

**Palette** — neutral-first, exactly one accent (emerald, saturation held low), no gradients.

| Token | Value |
|---|---|
| `--radius` | `0.5rem` |
| `--background` | `oklch(0.995 0 0)` |
| `--foreground` | `oklch(0.21 0.006 285.9)` |
| `--card` | `oklch(1 0 0)` |
| `--muted` | `oklch(0.967 0.001 286.4)` |
| `--muted-foreground` | `oklch(0.552 0.014 285.9)` |
| `--border` / `--input` | `oklch(0.92 0.004 286.3)` |
| `--primary` / `--ring` | `oklch(0.44 0.09 168)` |
| `--primary-foreground` | `oklch(0.985 0 0)` |
| `--destructive` | `oklch(0.577 0.196 27.3)` |
| `--chart-1..5` | `oklch(0.55 0.115 168)`, `oklch(0.62 0.09 200)`, `oklch(0.70 0.08 95)`, `oklch(0.60 0.10 30)`, `oklch(0.58 0.07 300)` |
| `--sidebar*` | background `oklch(0.985 0.001 286.4)`, accent `oklch(0.94 0.006 286.3)`, rest mirror `--primary`/`--border` |
| `--shadow-surface` | `0 1px 2px oklch(0.21 0.006 285.9 / 0.04), 0 12px 32px -16px oklch(0.21 0.006 285.9 / 0.12)` |

Dark mode (`.dark`) overrides the same names: `--background: oklch(0.16 0.004 285.9)` (off-black, never pure black), `--card: oklch(0.20 0.005 285.9)`, `--foreground: oklch(0.97 0 0)`, `--border: oklch(0.28 0.005 285.9)`, `--primary: oklch(0.72 0.11 168)`, `--primary-foreground: oklch(0.16 0.004 285.9)`, `--muted: oklch(0.24 0.005 285.9)`, `--muted-foreground: oklch(0.68 0.01 285.9)`. No glows, no outer `box-shadow` other than `--shadow-surface`.

**Typography** — `--font-sans: 'Geist'`, `--font-mono: 'Geist Mono'`. Landing/heading/title classes ship as Tailwind v4 `@utility` rules so pages cannot drift:

```css
@utility text-display  { font-size: 2.5rem;  line-height: 1.05; letter-spacing: -0.03em; font-weight: 600; }
@utility text-title    { font-size: 1.75rem; line-height: 1.15; letter-spacing: -0.02em; font-weight: 600; }
@utility text-subtitle { font-size: 1.25rem; line-height: 1.3;  letter-spacing: -0.01em; font-weight: 500; }
@utility text-body     { font-size: 1rem;    line-height: 1.65; }
@utility text-caption  { font-size: 0.8125rem; line-height: 1.5; }
@utility measure       { max-width: 65ch; }
@utility measure-prose { max-width: 720px; }
```

Dashboard uses `text-title`/`text-subtitle`/`text-caption`; the largest dashboard heading is `text-title` (design skill bans oversized H1s; `docs/DASHBOARD_DESIGN.md` §19 caps display at 32–40px). All numeric dashboard values render `font-mono` (`docs/DASHBOARD_DESIGN.md` §21, design skill `VISUAL_DENSITY` rule).

**Non-negotiable layout rules** (both surfaces):

- Full-height sections use `min-h-[100dvh]`, never `h-screen`.
- Content container: `max-w-[1400px] mx-auto px-6` (admin content `max-w-[1440px]`).
- Asymmetric desktop layouts MUST collapse to a single column below `md` (`w-full px-4`).
- No emoji anywhere: markup, copy, alt text, seed data. Icons only.
- Icon weight is **regular only**: `ph:github-logo` (never `-fill`/`-bold`), and `@phosphor-icons/vue` default weight.
- No pure black, no neon/outer glow, no gradient text on headings, no custom cursors.
- No equal 3-column card rows. Project list is a zig-zag (`lg:grid-cols-[1.4fr_1fr]`), article list is 2-column.
- Cards only where elevation communicates hierarchy; elsewhere group with `border-t` / `divide-y` / negative space.
- Every list/grid has loading (`Skeleton`), empty (`Empty`), and error states (`docs/DASHBOARD_DESIGN.md` §16, §17; design skill Rule 5).
- Interactive elements get tactile feedback: `active:translate-y-px` or `active:scale-[0.98]`.
- Reduced motion: wrap the app in motion-v `<MotionConfig reducedMotion="user">`; CSS fallback via a `@media (prefers-reduced-motion: reduce)` block in `tailwind.css`.
- Motion-v springs default to `{ type: 'spring', stiffness: 100, damping: 20 }`. Magnetic/mouse-following motion uses `useMotionValue` + `useTransform` only — never `useState` per frame. All perpetual micro-animations live in their own leaf component.

## Dependency set

Install in Phase 0 exactly these versions (all verified on the npm registry).

```bash
pnpm add nuxt@^4.5.2 vue@^3.5.43 vue-router@^5.3.1 \
  @nuxtjs/supabase@^2.0.10 @nuxt/icon@^2.5.1 @nuxt/fonts@^0.14.0 \
  @nuxtjs/sitemap@^8.5.1 @nuxtjs/robots@^6.2.3 \
  motion-v@^2.4.4 @vueuse/core@^15.0.0 \
  @unovis/vue@^1.7.0 @unovis/ts@^1.7.0 \
  @tiptap/vue-3@^3.31.3 @tiptap/pm@^3.31.3 @tiptap/starter-kit@^3.31.3 \
  @tiptap/extension-link@^3.31.3 @tiptap/extension-image@^3.31.3 @tiptap/extension-placeholder@^3.31.3 \
  zod@^4.6.5 vee-validate@^4.15.1 @vee-validate/zod@^4.15.1

pnpm add -D tailwindcss@^4.3.3 @tailwindcss/vite@^4.3.3 shadcn-nuxt@^2.8.2 \
  @iconify-json/ph@^1.2.2 typescript vue-tsc
```

`reka-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `@phosphor-icons/vue` are added by the shadcn-vue CLI in Phase 0 — do not install them by hand.

---

## Phase 0 — Foundation and toolchain

**Step 0.1 — Scaffold without touching `docs/`.** `nuxi init` refuses a non-empty directory unless `--force`, which would delete `docs/`. Scaffold elsewhere and copy in:

```bash
cd /tmp && rm -rf wp-scaffold
pnpm create nuxt@latest wp-scaffold --template minimal --packageManager pnpm --no-install --no-gitInit
cd /Users/lrndwy/MyProjects/web-portofolio-v2
rsync -a --exclude '.git' --exclude 'README.md' /tmp/wp-scaffold/ ./
```

Then set `"name": "web-portofolio-v2"` in `package.json`.

**Step 0.2 — Git and ignores.** `git init`. Append to the template `.gitignore`: `.env`, `.env.*`, `!.env.example`, `.vercel`.

**Step 0.3 — Install and shadcn init.**

```bash
pnpm install
pnpm dlx shadcn-vue@latest init -t nuxt -b neutral --base reka --icon-library phosphor --font geist --css-variables -y -f
```

`--style` is intentionally omitted; the CLI falls back to its default style and Phase 2 overwrites every token anyway. If the CLI prompts interactively, accept each default. This writes `components.json`, `app/lib/utils.ts` (`cn`), and the token block into `app/assets/css/tailwind.css`.

**Step 0.4 — Add shadcn components.**

```bash
pnpm dlx shadcn-vue@latest add -y -o \
  button input textarea label select switch checkbox badge separator skeleton progress \
  dialog sheet dropdown-menu tooltip popover tabs table card alert alert-dialog \
  breadcrumb sidebar command collapsible scroll-area avatar form field empty sonner pagination
```

`Empty` and `Field` are required by the empty-state and form rules above; `Sonner` is the toast surface (`docs/DASHBOARD_DESIGN.md` §17).

**Step 0.5 — `nuxt.config.ts`.** Replace the generated file with:

```ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    'shadcn-nuxt',
    '@nuxtjs/supabase',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
  ],

  css: ['~/assets/css/tailwind.css'],
  vite: { plugins: [tailwindcss()] },

  shadcn: { prefix: '', componentDir: '@/components/ui' },

  fonts: {
    families: [
      { name: 'Geist', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Geist Mono', provider: 'google', weights: [400, 500] },
    ],
  },

  icon: { mode: 'svg', serverBundle: { collections: ['ph'] } },

  supabase: {
    redirect: true,
    redirectOptions: {
      login: '/admin/login',
      callback: '/admin/confirm',
      include: ['/admin(/*)?'],
      exclude: [
        '/admin/login', '/admin/confirm',
        '/admin/forgot-password', '/admin/reset-password',
      ],
      saveRedirectToCookie: true,
    },
  },

  runtimeConfig: {
    supabaseSecretKey: '',   // NUXT_SUPABASE_SECRET_KEY
    analyticsSalt: '',       // NUXT_ANALYTICS_SALT
    githubToken: '',         // NUXT_GITHUB_TOKEN  (optional)
    cronSecret: '',          // NUXT_CRON_SECRET
    public: { siteUrl: '' }, // NUXT_PUBLIC_SITE_URL
  },

  routeRules: {
    '/api/router': { cors: true },
    '/admin/**': { ssr: false },
    '/': { swr: 300 },
    '/projects': { swr: 600 },
    '/blog': { swr: 600 },
    '/blog/**': { swr: 600 },
  },

  nitro: { compressPublicAssets: true },

  sitemap: { sources: ['/api/__sitemap__/urls'] },
})
```

Leave `supabase.types` at its default; Phase 1 generates `app/types/database.types.ts`, which the default path already points at. `@nuxtjs/robots` needs no config (defaults to allow-all with sitemap reference).

**Step 0.6 — `.env.example`.** Commit this file with empty values; `.env` stays ignored.

```
NUXT_PUBLIC_SUPABASE_URL=
NUXT_PUBLIC_SUPABASE_KEY=
NUXT_SUPABASE_SECRET_KEY=
NUXT_ANALYTICS_SALT=
NUXT_GITHUB_TOKEN=
NUXT_CRON_SECRET=
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

`NUXT_PUBLIC_*` values reach the browser by design (Supabase URL + publishable key are RLS-bound and safe). `NUXT_SUPABASE_SECRET_KEY`, `NUXT_ANALYTICS_SALT`, and `NUXT_CRON_SECRET` are server-only and must never appear in `public`.

**Step 0.7 — Test script.** In `package.json` add `"test": "node --test tests/unit/"` and `"typecheck": "nuxt typecheck"`. Node 26 strips TypeScript natively, so no test framework is needed for the pure-helper tests added in Phase 2 and Phase 9.

**Acceptance:** `pnpm dev` serves the default Nuxt page at `http://localhost:3000` with `shadcn-nuxt` loaded and no module-resolution warnings.

---

## Phase 1 — Database schema, RLS, and seed

Column definitions come from `docs/SUPABASE_SCHEMA.md` and are **not restated here**. This phase implements that document plus the additions below, which the document does not specify and which later phases depend on.

**Step 1.1 — Migration files.** Create `supabase/migrations/` with, in this order:

| File | Contents |
|---|---|
| `20260917000001_identity.sql` | `user_profiles`; `is_owner()` helper; RLS |
| `20260917000002_portfolio.sql` | `profiles`, `experiences`, `achievements`, `educations`, `socials`, `documents`; `docs/SUPABASE_SCHEMA.md` §9 indexes; RLS |
| `20260917000003_blog.sql` | `blog_categories`, `blog_tags`, `blog_posts`, `blog_post_tags`; `blog_posts(slug)` and `blog_posts(status, published_at)` indexes; RLS |
| `20260917000004_github.sql` | `github_settings`, `github_repositories`; `pushed_at` and `(is_featured, is_visible)` indexes; RLS |
| `20260917000005_ai_router.sql` | `ai_router_settings`, `ai_providers`, `ai_models`, `ai_api_keys`, `ai_usage_logs`, `ai_rate_limits`; `ai_rate_limit_hit()`; RLS |
| `20260917000006_analytics.sql` | `analytics_visitors`, `analytics_sessions`, `analytics_pageviews`, `analytics_events`; §9 indexes; RLS with **no** anon policy |
| `20260917000007_website.sql` | `site_settings`, `navigation_items`; RLS |

**Step 1.2 — Additions the schema document omits.** Add all of these; later phases assume them.

```sql
-- Owner check. SECURITY DEFINER so RLS policies can read user_profiles without recursion.
create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'OWNER'
  );
$$;

-- Singleton tables: ai_router_settings, github_settings, site_settings.
-- Enforces exactly one row without adding a surrogate column.
create unique index ai_router_settings_singleton on public.ai_router_settings ((true));
create unique index github_settings_singleton    on public.github_settings    ((true));
create unique index site_settings_singleton      on public.site_settings      ((true));

-- ai_rate_limits: the window key the atomic counter upserts on.
create unique index ai_rate_limits_key on public.ai_rate_limits (identifier, window_type);

-- ai_models.display_name is the public model identifier sent by router clients.
-- It must be unambiguous, so it is globally unique (case-insensitive).
-- (provider_id, model_name) uniqueness from the schema doc still applies.
create unique index ai_models_display_name_key on public.ai_models (lower(display_name));
create index ai_models_provider_active on public.ai_models (provider_id, is_active);

-- Analytics rollups.
create index analytics_visitors_last_seen on public.analytics_visitors (last_seen_at);
create index analytics_sessions_visitor   on public.analytics_sessions (visitor_id, last_activity_at);
```

**Step 1.3 — `ai_rate_limit_hit`.** Single-statement atomic fixed-window counter. Replaces any read-then-write in application code, which would race under concurrent router requests.

```sql
create or replace function public.ai_rate_limit_hit(
  p_identifier text, p_window_type text, p_window_seconds int, p_limit int
) returns table (allowed boolean, current_count int, reset_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare v_now timestamptz := now(); v_row public.ai_rate_limits;
begin
  insert into public.ai_rate_limits
    (identifier, window_type, request_count, window_started_at, expires_at)
  values (p_identifier, p_window_type, 0, v_now, v_now + make_interval(secs => p_window_seconds))
  on conflict (identifier, window_type) do update set
    request_count = case when public.ai_rate_limits.expires_at <= v_now
                         then 0 else public.ai_rate_limits.request_count end,
    window_started_at = case when public.ai_rate_limits.expires_at <= v_now
                             then v_now else public.ai_rate_limits.window_started_at end,
    expires_at = case when public.ai_rate_limits.expires_at <= v_now
                      then v_now + make_interval(secs => p_window_seconds)
                      else public.ai_rate_limits.expires_at end
  returning * into v_row;

  if p_limit > 0 and v_row.request_count >= p_limit then
    return query select false, v_row.request_count, v_row.expires_at;
    return;
  end if;

  update public.ai_rate_limits
     set request_count = request_count + 1
   where id = v_row.id
  returning request_count, expires_at into v_row.request_count, v_row.expires_at;

  return query select true, v_row.request_count, v_row.expires_at;
end $$;

-- Router calls this with the service-role key, which is unaffected by grants.
-- Client-side roles must never reach it.
revoke all on function public.ai_rate_limit_hit(text, text, int, int)
  from public, anon, authenticated;
```

A `p_limit` of `0` or less means "unlimited" for that window.

**Step 1.4 — RLS policy set.** Apply per table:

| Tables | anon | authenticated (owner) |
|---|---|---|
| `profiles` | `select` where `is_visible` | all, where `is_owner()` |
| `experiences`, `achievements`, `educations`, `socials` | `select` where `is_visible` | all, where `is_owner()` |
| `documents` | `select` where `is_active and is_visible` | all, where `is_owner()` |
| `blog_posts` | `select` where `status = 'published' and published_at <= now()` | all, where `is_owner()` |
| `blog_categories`, `blog_tags`, `blog_post_tags` | `select` (public taxonomy) | all, where `is_owner()` |
| `github_repositories` | `select` where `is_visible` | all, where `is_owner()` |
| `navigation_items` | `select` where `is_visible` | all, where `is_owner()` |
| `site_settings` | `select` (needed for public meta/logo) | `update`, where `is_owner()` |
| `github_settings` | none | all, where `is_owner()` |
| `ai_router_settings`, `ai_providers`, `ai_models`, `ai_api_keys`, `ai_usage_logs`, `ai_rate_limits` | none | all, where `is_owner()` |
| `analytics_visitors`, `analytics_sessions`, `analytics_pageviews`, `analytics_events` | none | `select`, where `is_owner()` |
| `user_profiles` | none | `select`, where `id = auth.uid()` |

`ai_providers`, `ai_api_keys`, and all analytics tables are additionally reached only through service-role server routes; the policies above are the second line of defence, not the only one. Enable RLS on every table (`alter table ... enable row level security`) — a table with no policy and RLS on is unreadable to anon, which is the intended state for the "none" rows.

**Step 1.5 — Storage buckets.** Create `avatars` (public), `site-assets` (public), `blog-images` (public), `achievement-images` (public), `documents` (private). Grant anon `select` on the four public buckets only. The private `documents` bucket is read exclusively through signed URLs minted in `server/api/public/documents.get.ts`.

**Step 1.6 — `supabase/seed.sql`.** Idempotent (`on conflict do nothing`):
- one `site_settings` row — `site_name = 'Hafiz Agha Al-Baith'`, `meta_title`, `meta_description`, `maintenance_mode = false`
- one `ai_router_settings` row — `is_enabled = false`, `monthly_token_limit = 100000`, `requests_per_minute = 10`, `requests_per_hour = 120`, `requests_per_day = 1000`, `quota_exceeded_message = 'Monthly token quota exhausted. Try again next month.'`
- one `github_settings` row — `max_projects = 6`, `auto_sync = false`
- navigation items, in order: Home `/`, About `/about`, Experience `/experience`, Projects `/projects`, Blog `/blog`, AI Router `/router`, Contact `/contact` — all `is_visible = true`, `is_external = false`
- one `blog_categories` row (`Notes`, slug `notes`), one inactive OpenAI-compatible `ai_providers` row, one inactive `ai_models` row
- **no** `profiles`, `experiences`, or `blog_posts` rows — empty states must be reachable

Leave `profiles` empty on purpose: the public site's empty state is part of acceptance, and seeding fake content would hide it.

**Step 1.7 — Generate types.** `pnpm dlx supabase gen types --lang=typescript --project-id <id> > app/types/database.types.ts`, then wire it in `shared/types/db.ts` as `Database` re-exports and row aliases (`ProfileRow`, `ExperienceRow`, `BlogPostRow`, `AiProviderRow`, `AiModelRow`, `AiUsageLogRow`, …) used by both app and server code.

**Acceptance:** all migrations apply cleanly, `pnpm dev` boots with the typed Supabase client, and `select * from ai_rate_limit_hit('probe','minute',60,1)` returns `allowed = true` on the first call and `allowed = false` on the second.

---

## Phase 2 — Design system and app shell

**Step 2.1 — Replace `app/assets/css/tailwind.css` wholesale** with the token block from **Design system contract**, plus:

```css
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));

/* :root and .dark token blocks — exact values from the contract table */

@theme inline {
  --font-sans: 'Geist', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, SFMono-Regular, monospace;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  /* … every remaining shadcn token mapped the same way … */
  --color-chart-1: var(--chart-1);
  /* … chart-2 … chart-5 … */
  --shadow-surface: var(--shadow-surface);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
}

/* the @utility rules from the contract */

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Delete any `@import url('https://fonts.googleapis.com/...')` the shadcn CLI injected — `@nuxt/fonts` self-hosts Geist at build time and a second source would double-load it.

**Step 2.2 — Theme composable.** `app/composables/useTheme.ts` exposing `{ theme: Ref<'light'|'dark'>, setTheme, toggle }`. Persist to `localStorage['wp-theme']`; default `'light'` (light-first). Apply by toggling `document.documentElement.classList`. To avoid a first-paint flash, add an inline script in `nuxt.config.ts` under `app.head.script` that reads `localStorage` and sets the class before hydration.

**Step 2.3 — Motion primitives.**
- `app/components/site/RevealOnScroll.vue` — one component, the only entrance animation wrapper in the codebase. `IntersectionObserver` (via `@vueuse/core` `useIntersectionObserver`), commits once, `motion-v` `<motion.div>` with `:initial="{ opacity: 0, y: 12 }"` → `:animate="{ opacity: 1, y: 0 }"` and a `delay` prop for cascade. No `window.addEventListener('scroll')`.
- `app/app.vue` renders `<NuxtRouteAnnouncer />`, `<NuxtLayout>`, `<NuxtPage />`, inside `<MotionConfig :reduced-motion="'user'">`. Importing `MotionConfig` from `motion-v`.

**Step 2.4 — Shared utilities in `shared/utils/`** (auto-imported in both app and server):

| File | Exports | Contract |
|---|---|---|
| `shared/utils/slug.ts` | `slugify(input: string): string` | lowercase, NFD-normalised, strips diacritics, non-alphanumerics → `-`, collapses runs, trims `-`; empty input → `'untitled'` |
| `shared/utils/slug.ts` | `uniqueSlug(base: string, taken: string[]): string` | returns `base` if free, else `base-2`, `base-3`, … |
| `shared/utils/ua.ts` | `parseUserAgent(ua: string \| undefined): { device_type: string; browser: string; os: string }` | device ∈ `desktop\|mobile\|tablet\|unknown`; browser ∈ `chrome\|firefox\|safari\|edge\|opera\|other`; os ∈ `windows\|macos\|ios\|android\|linux\|other` |
| `shared/utils/ua.ts` | `isBot(ua: string \| undefined): boolean` | matches `/(bot\|crawler\|spider\|crawling\|headless\|pingdom\|uptime\|monitor\|lighthouse)/i` |
| `shared/utils/format.ts` | `formatNumber(n: number): string` | thousands separators |
| `shared/utils/format.ts` | `formatCompact(n: number): string` | `82421` → `82.4K` |
| `shared/utils/format.ts` | `formatPercent(n: number, digits = 1): string` | `0.182` → `18.2%` |
| `shared/utils/format.ts` | `formatDate(iso: string \| null, locale = 'en-GB'): string` | `'17 Sep 2026'`; `null` → `'—'` |
| `shared/utils/format.ts` | `formatMonthRange(start: string, end: string \| null, isCurrent: boolean): string` | `'2026 — Present'` when `isCurrent`, else `'2024 — 2026'` |

**Step 2.5 — Unit test.** `tests/unit/shared-utils.test.ts` using `node:test` + `node:assert/strict`. Cover: `slugify('Halo, Dunia!') === 'halo-dunia'`, `slugify('') === 'untitled'`, `uniqueSlug('notes', ['notes','notes-2']) === 'notes-3'`, `isBot` on a Chrome UA is `false` and on `Googlebot/2.1` is `true`, `parseUserAgent` maps an iPhone Safari UA to `mobile/safari/ios` and a Windows Chrome UA to `desktop/chrome/windows`, `null` UA → `unknown/other/other`, `formatPercent(0.182) === '18.2%'`. Guard `parseUserAgent`'s null path and `uniqueSlug`'s numbering — both are pure, both are easy to get subtly wrong, and both feed user-visible output.

**Step 2.6 — Error page and global states.** `app/error.vue` renders the shadcn `Empty`-style composition for 404 and 403 with a link home; it reads `error.statusCode` and shows a distinct message for 403 (used by the admin role guard in Phase 3).

**Acceptance:** `pnpm test` passes. `pnpm dev` renders a page using `text-display`, `bg-background`, `text-foreground`, `font-sans`, and `<Icon name="ph:github-logo" />` with Geist loaded from the local build (no request to `fonts.googleapis.com` in the network panel), and the dark-mode toggle flips `.dark` on `<html>` with no flash on reload.

---

## Phase 3 — Owner authentication and admin shell

**Step 3.1 — Owner bootstrap.** Documented in `docs/SUPABASE_SCHEMA.md` §12. Add `scripts/bootstrap-owner.sql` (not a migration — it is run once by hand): insert into `user_profiles (id, display_name, role)` with `role = 'OWNER'` for a user UUID created in the Supabase dashboard. No public registration route exists anywhere in the app.

**Step 3.2 — `requireOwner` utility.** `server/utils/auth.ts`:

```ts
export async function requireOwner(event: H3Event): Promise<{ userId: string; displayName: string }>
```

Calls `serverSupabaseUser(event)`; if absent → `createError({ statusCode: 401, statusMessage: 'unauthenticated' })`. Then reads `user_profiles` via `serverSupabaseClient(event)`; if role is not `OWNER` → `createError({ statusCode: 403, statusMessage: 'forbidden' })`. Returns the owner identity. **Every** `/api/admin/**` handler and `server/api/me.get.ts` calls this as its first statement. It is a utility rather than a server middleware because a path-matching middleware would silently miss a route the moment one is added.

**Step 3.3 — Admin page middleware.** `app/middleware/admin.ts` (named, not global): `await $fetch('/api/me')` inside a `try`; on 401 `return navigateTo('/admin/login')`, on 403 `throw createError({ statusCode: 403, fatal: true })`. Results are cached in `useState('owner')` so navigation between admin pages does not refetch. Applied via `definePageMeta({ middleware: 'admin' })` in `app/layouts/admin.vue` — set it on the layout so every admin page inherits it and none can forget it.

**Step 3.4 — Auth routes.** `server/api/me.get.ts` returns `{ userId, displayName, role }` via `requireOwner`.

Admin auth pages use the `@nuxtjs/supabase` composables, never custom HTTP:
- `app/pages/admin/login.vue` — `useSupabaseClient().auth.signInWithPassword({ email, password })`; on success `navigateTo(useSupabaseCookieRedirect().path.value || '/admin/dashboard')`.
- `app/pages/admin/forgot-password.vue` — `auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl}/admin/reset-password` })`.
- `app/pages/admin/reset-password.vue` — `auth.updateUser({ password })` guarded by `auth.onAuthStateChange` `PASSWORD_RECOVERY` event.
- `app/pages/admin/confirm.vue` — the module's OAuth/PKCE callback target (`redirectOptions.callback`).
- Logout: `AdminTopbar.vue` calls `auth.signOut()` then `navigateTo('/admin/login')`.

`app/layouts/auth.vue` is the centered single-column shell for these four pages, with the page title above the form and field-level errors below each input (`docs/DASHBOARD_DESIGN.md` §19, design skill Rule 6).

**Step 3.5 — Admin shell.** `app/layouts/admin.vue` = `AdminSidebar` + `AdminTopbar` + `<slot />`.
- `app/components/admin/AdminSidebar.vue` — use the shadcn `Sidebar` primitives. Groups and labels exactly as `docs/DASHBOARD_DESIGN.md` §4: Overview; ANALYTICS (Analytics); PORTFOLIO (Profile, Experience, Achievement, Education, Social Media, Documents); CONTENT (Projects, Blog); AI ROUTER (Overview, Providers, Models, API Key, Usage, Logs); WEBSITE (General, Navigation, SEO, Maintenance); SETTINGS (Account, Security). Collapsible on `lg`, drawer below. Icon-only when collapsed, with a `Tooltip` on each item. Active item uses `sidebar-primary` for the icon and label plus `sidebar-accent` background — no left border bar.
- `app/components/admin/AdminTopbar.vue` — page title from `useRoute().meta.title`, breadcrumb, `CommandMenu` trigger with a `Kbd` showing `⌘K`, "Open public website" link, theme toggle, avatar dropdown (Account, Sign out). Sticky, `border-b`, no shadow.
- `app/components/admin/CommandMenu.vue` — shadcn `Command` in a `Dialog`. Actions and their `@select` handlers: *Edit Profile* → `/admin/profile`; *Create Blog* → `/admin/blog/new`; *Manage Providers* → `/admin/router/providers`; *View Analytics* → `/admin/analytics`; *Open Public Website* → `/` in a new tab. Bound to `⌘K`/`Ctrl+K` via `useMagicKeys` from `@vueuse/core`.

**Step 3.6 — Admin placeholder pages.** Create every route from `docs/PRD.md` §6 Admin as a file, each with `definePageMeta({ title: '…' })` and an `Empty` state naming the phase that fills it. Routing must be complete before the phases that fill it, so no later phase invents a path.

```
app/pages/admin/dashboard.vue          analytics.vue
app/pages/admin/profile.vue            experience.vue
app/pages/admin/achievement.vue        education.vue
app/pages/admin/social.vue             documents.vue
app/pages/admin/projects.vue           blog/index.vue
app/pages/admin/blog/new.vue           blog/[id].vue
app/pages/admin/router/index.vue       router/providers.vue
app/pages/admin/router/models.vue      router/api-key.vue
app/pages/admin/router/usage.vue       router/logs.vue
app/pages/admin/website.vue            admin/settings.vue
```

**Acceptance:** unauthenticated visit to `/admin/dashboard` lands on `/admin/login`; a valid Owner login reaches the dashboard shell; a signed-in non-OWNER user gets the 403 error page; logout returns to login; `⌘K` opens the command menu and `Edit Profile` navigates.

---

## Phase 4 — Portfolio CMS

**Step 4.1 — Generic resource layer.** Six resources (experience, achievement, education, socials, documents, navigation) plus two taxonomy resources share one implementation. Build it once here; do not hand-write 24 endpoint files.

`server/utils/resources.ts` exports:

```ts
export interface ResourceDef {
  table: string
  insert: ZodType
  update: ZodType
  orderColumn?: string          // 'display_order' where applicable
  defaultOrder?: { column: string; ascending: boolean }
  searchColumns?: string[]     // used by the list handler's ?q=
  relations?: string           // supabase select() string
}
export const resources: Record<string, ResourceDef>
```

with entries keyed `experience`, `achievement`, `education`, `socials`, `documents`, `navigation`, `blog-categories`, `blog-tags`. Each zod schema lives in `shared/schemas/resources.ts` and is imported via `#shared/schemas/resources` so the admin forms and the server validate identically. Required-field rules follow the schema doc's nullability: `experiences.title`, `.organization`, `.start_date` required; `end_date` required unless `is_current`; same shape for `educations`, `achievements`, `socials` (`platform`, `url` required, `url` must parse as a URL), `documents` (`name`, `file_path` required), `navigation` (`label`, `path` required).

Endpoints, all calling `requireOwner(event)` first:

| Route | Behaviour |
|---|---|
| `GET /api/admin/resources/[resource]` | paginated list; query `page` (default 1), `pageSize` (default 20, max 100), `q` (case-insensitive match across `searchColumns`), `sort`; returns `{ items, total, page, pageSize }`. Unknown `resource` → 404. |
| `POST /api/admin/resources/[resource]` | validate with `insert`; assign `display_order = max(display_order) + 1` when the def has `orderColumn`; 201 with the row |
| `PATCH /api/admin/resources/[resource]/[id]` | validate with `update`; 404 when no row matched |
| `DELETE /api/admin/resources/[resource]/[id]` | delete; 404 when no row matched |
| `PATCH /api/admin/resources/[resource]/reorder` | body `{ ids: string[] }`; writes `display_order = index` for each id |

Reorder uses a plain `Promise.all` of updates through the service-role client. Cardinality is single-digit per resource, so an RPC would be more machinery than the problem needs.

**Step 4.2 — Uploads.** `server/api/admin/upload.post.ts`: `requireOwner`, then `readMultipartFormData(event)` with fields `bucket` and `file`. Reject `bucket` not in `['avatars','documents','blog-images','achievement-images','site-assets']` → 400. Reject `file.data.byteLength > 5 * 1024 * 1024` → 413. Reject `file.type` outside `['image/png','image/jpeg','image/webp','image/avif','application/pdf']` → 415. Store at `${crypto.randomUUID()}/${slugify(file.filename ?? 'file')}` via `serverSupabaseServiceRole(event).storage.from(bucket).upload(...)`. Return `{ path, publicUrl }` (public buckets) or `{ path }` (documents).

**Step 4.3 — Client resource composable.** `app/composables/useResource.ts`:

```ts
export function useResource<T>(resource: string) {
  return { items, total, pending, error, page, pageSize, q,
           refresh, create, update, remove, reorder }
}
```

Hits `/api/admin/resources/${resource}`, refreshes after any mutation, and surfaces failures through `Sonner` toasts (`toast.error(...)`) — components must not roll their own fetch or error handling.

**Step 4.4 — Shared admin CRUD components.**
- `app/components/admin/ResourceTable.vue` — props `{ columns: ColumnDef[], rows, pending, page, pageSize, total, emptyTitle, emptyBody }`. Renders a shadcn `Table` at `md+` and a stacked card list below `md` (`docs/DASHBOARD_DESIGN.md` §18). Loading renders `Skeleton` rows matching the column count; empty renders the shadcn `Empty` with an action slot.
- `app/components/admin/ResourceFormShell.vue` — props `{ title, schema, initial, submitting }`. vee-validate `useForm` with `toTypedSchema`, label above input, helper text optional, error text below input, `gap-2` input blocks, a sticky action bar at `md+`, single-column below (`docs/DASHBOARD_DESIGN.md` §18).
- `app/components/admin/ImageUploadField.vue` — wraps `/api/admin/upload` for `avatars`, `achievement-images`, `blog-images`, `site-assets`; preview, replace, clear; shows a `Skeleton` during upload and disables submit while pending.
- `app/components/admin/FileUploadField.vue` — same for `documents` (PDF only).
- `app/components/admin/VisibilityToggle.vue` — a `Switch` bound to `is_visible` that PATCHes immediately and reverts with an error toast on failure.
- `app/components/admin/OrderControls.vue` — up/down buttons calling `reorder` with the swapped id list; disabled at the ends.

Short forms (socials, navigation) use a `Dialog`; long forms (experience, education, documents, achievement) use a dedicated page and a dedicated form page. This split follows `docs/DASHBOARD_DESIGN.md` §14.

**Step 4.5 — Profile singleton.** `server/api/admin/profile.get.ts` and `profile.put.ts` (not the generic resource layer, since it is a single row). Public read is RLS-filtered on `is_visible`, so no public route is required. `app/pages/admin/profile.vue` binds `name`, `title`, `short_description`, `description` (Textarea, 6 rows), `avatar_url` (ImageUploadField, `avatars`), `location`, `email`, `phone`, `github_username`, `website_url`, `is_visible`.

**Step 4.6 — Admin pages.** Fill `experience.vue`, `achievement.vue`, `education.vue`, `social.vue`, `documents.vue` and the navigation editor (on `website.vue`, Phase 11) using the components above. Every list page follows the `docs/DASHBOARD_DESIGN.md` §14 pattern: page header, then a row of `[Search] [Filter] [+ Add]`, then the table, then pagination.

**Acceptance:** create an `experience` row from the dashboard → it appears at the top of the admin list and, after the SWR window, on `/experience`; toggle `is_visible` off → it disappears from `/experience` but stays in the admin list; reorder two rows → the public order matches; delete → gone from both; uploading a PNG avatar over 5 MB shows an inline error and no row is written.

---

## Phase 5 — Public portfolio site

**Step 5.1 — Data access.** Public pages read through `useSupabaseClient()` (anon key, RLS-enforced) inside `useAsyncData`, so visibility filtering is enforced by the database rather than by route code. No public read endpoints are created. Where the anon client cannot be used, say so explicitly in the code comment; the only such case in this plan is signed document URLs (Step 5.8).

`app/composables/useSiteContent.ts` exports the shared loaders, each `useAsyncData` with a stable `key` and `getCachedData` so payload extraction works with the SWR route rules:

| Loader | Query |
|---|---|
| `useSiteSettings()` | `site_settings` single row |
| `useNavigation()` | `navigation_items` where `is_visible`, ordered by `display_order`; drops the `/router` item when `ai_router_settings.is_enabled` is false |
| `useProfile()` | `profiles` where `is_visible` limit 1 |
| `useExperiences()` | `experiences` where `is_visible` order `is_current desc, display_order asc` |
| `useAchievements()` | `achievements` where `is_visible` order `display_order asc` |
| `useEducations()` | `educations` where `is_visible` order `display_order asc` |
| `useSocials()` | `socials` where `is_visible` order `display_order asc` |
| `useFeaturedProjects()` | `github_repositories` where `is_visible` order `is_featured desc, pushed_at desc` limit `github_settings.max_projects` |
| `useArticles(limit, page?)` | `blog_posts` where `status = 'published'` and `published_at <= now()`, joined to `blog_categories` and tags, order `published_at desc` |

`ai_router_settings.is_enabled` is not anon-readable (Phase 1 RLS). The nav loader therefore reads it from `GET /api/router/info` instead of from the table.

**Step 5.2 — Public layout.** `app/layouts/default.vue`: `AppNav`, `<slot />`, `AppFooter`. Public pages set `definePageMeta({ layout: 'default' })` or rely on it being the only non-admin layout (rename `auth.vue` scoping aside — `auth.vue` is only used by admin auth pages, which set it explicitly).

**Step 5.3 — `AppNav`.** Sticky, compact (`h-16`), `border-b`, `backdrop-blur` with a `border-white/10` inner edge only when scrolled (design skill "Liquid Glass" — a 1px inner border and a subtle inner shadow, never an outer glow). Desktop: logo/name left, nav items centered or right, `[CV]` button at the far right. Below `md`: logo left, a `Sheet` drawer right, navigation items stacked full-width with `py-3` tap targets. Active item gets `text-foreground` + an accent underline transition of 150–250ms; inactive is `text-muted-foreground` with a hover transition.

Link behavior from DB rows: when `is_external` is true render `<a target="_blank" rel="noopener">`, otherwise `<NuxtLink>`. Icons render from the row's `icon` column via `<Icon :name="item.icon" />` when present.

**Step 5.4 — Homepage** (`app/pages/index.vue`), section order from `docs/WEB_PORTOFOLIO_DESIGN.md` §4. Each section renders only when its data is non-empty, so an Owner can disable a section by hiding its content (`docs/WEB_PORTOFOLIO_DESIGN.md` §4).

- **Hero** — asymmetric: `grid md:grid-cols-[1.35fr_1fr]`, text left, visual right, mobile stacks to one column. Height `min-h-[62dvh]` (`docs/WEB_PORTOFOLIO_DESIGN.md` §5 says the hero must be short; the design skill bans centered heroes at `DESIGN_VARIANCE > 4`). Contains: `Hi, I'm {profile.name}.` as `text-title` (not oversized), `{profile.title}` as `text-subtitle`, `{profile.short_description}` as `text-body measure`, a `StatusDot` + "Available for selected opportunities", `[View Projects]` primary button and `[Read About Me]` ghost button, and the social row. The primary CTA is the app's single magnetic element: `useMotionValue` + `useTransform` + `useSpring` drive a `translate`, capped at 6px, disabled when `prefers-reduced-motion` or the pointer is coarse. Hero visual: a `picsum.photos` placeholder is **not** used; render `profile.avatar_url` when present, otherwise a token-coloured geometric composition built from plain `div`s — no external image dependency.
- **Selected Projects** — zig-zag, not a 3-column grid: alternating `lg:grid-cols-[1.4fr_1fr]` and `lg:grid-cols-[1fr_1.4fr]`. The first row is the featured layout from §12 (larger, with description and stack); the rest use `ProjectCard`.
- **Experience** — `ExperienceTimeline` with a 1px vertical rule and small markers, `formatMonthRange` on the left, organization + role + description on the right.
- **About** — two columns `lg:grid-cols-[1.6fr_1fr]`: prose left (`measure`), Quick Facts right (Location, Focus, Experience count, Education), mobile single column.
- **Latest Articles** — 3 most recent, `ArticleCard`, 2-column grid at `md+`.
- **AI Router** — a condensed `RouterEndpointCard` when enabled: endpoint URL, "Operational" status dot, model count, and a link to `/router`. Hidden entirely when disabled.
- **Contact** — "Let's build something." + email + socials + a mailto CTA.

**Step 5.5 — Content pages.** `/about`, `/experience`, `/achievement`, `/education` each render their loader's list plus a composed empty state ("Nothing published yet.") when empty. `/achievement` uses the compact grid from `docs/WEB_PORTOFOLIO_DESIGN.md` §9 (title, issuer, date, `Certificate →`), image only when present. `/education` uses the minimal timeline from §10.

**Step 5.6 — `/projects`.** Filters (language, featured) rendered as `Toggle` chips; the list is the same zig-zag. Card body per §11: name, short description, `language · stars · forks` in `font-mono` metadata, `updated` relative date, GitHub link, Live Demo link when `homepage_url` exists. Empty state explains that the Owner must run a GitHub sync.

**Step 5.7 — Shared public components** in `app/components/site/`: `SectionShell.vue` (section id + `SectionHeading` + consistent vertical rhythm `py-20 md:py-28`), `SectionHeading.vue` (`text-title` + a `text-caption` overline), `StatusDot.vue` (an infinite `motion-v` opacity/scale pulse on the dot only, isolated in its own component), `ProjectCard.vue`, `FeaturedProject.vue`, `ExperienceTimeline.vue`, `AchievementGrid.vue`, `EducationList.vue`, `ArticleCard.vue`, `SocialLinks.vue`, `RouterEndpointCard.vue`, `CopyButton.vue`, `MagneticCta.vue`.

`CopyButton.vue` uses `navigator.clipboard.writeText`, swaps to a `ph:check` icon for 1.5 s, and announces via `aria-live="polite"`.

**Step 5.8 — `/cv` and documents.** `server/api/public/documents.get.ts` is the one public read route: it lists `documents` where `is_active and is_visible` and, for the private bucket, mints a 300-second signed URL per row with the service-role client. Returns `{ id, name, version, url, file_type }[]`. `app/pages/cv.vue` lists them with a download action that fires `trackEvent('cv_download', { document_id })`. Re-fetch on each visit; signed URLs must not be cached in `useAsyncData`'s payload.

**Step 5.9 — `/contact`.** Email, socials, and a mailto CTA that fires `trackEvent('contact_submit')`. No server-side contact form exists: `docs/SUPABASE_SCHEMA.md` defines no messages table and `docs/WEB_PORTOFOLIO_DESIGN.md` §16 makes the form conditional. A real form belongs with a `contact_messages` table and an email provider, which are not in scope here.

**Step 5.10 — SEO.** `app/composables/useSeo.ts` wraps `useSeoMeta` with site defaults from `useSiteSettings()` and per-page overrides: `title`, `description`, `ogTitle`, `ogDescription`, `ogImage` (`og_image_url`), `twitterCard: 'summary_large_image'`, `canonical`. Every public page calls it. `server/api/__sitemap__/urls.ts` returns static routes plus every published `blog_posts.slug` and `github_repositories` is *not* included (projects have no detail page).

**Acceptance:** with only seed data, `/` renders the hero and hides every empty section; after Phase 4's experience row exists, `/experience` shows it; `/cv` produces a working signed URL; `/sitemap.xml` lists every public route plus published slugs; `/robots.txt` allows all.

---

## Phase 6 — GitHub integration

**Step 6.1 — Sync handler.** `server/utils/github.ts` exports `syncRepositories(username, token?)`:
- `GET https://api.github.com/users/${username}/repos?sort=pushed&direction=desc&per_page=100` with `Accept: application/vnd.github+json`, `User-Agent: portfolio-platform`, and `Authorization: Bearer ${token}` when a token is configured.
- Follow `Link: rel="next"` up to 3 pages (300 repositories is a sane ceiling; `ponytail:` note it inline and raise the cap if an account exceeds it).
- Map each repo to the `github_repositories` columns. Ignore forks and archived repositories — they add noise to a portfolio and the doc's card design has no field to explain them.
- Upsert on `github_id`. **Never overwrite** `is_featured`, `is_visible`, or `display_order` — those are Owner decisions; only synced metadata is refreshed (`name`, `full_name`, `description`, `html_url`, `homepage_url`, `language`, `stars`, `forks`, `pushed_at`, `synced_at`).
- On first insert (no existing row) set `is_visible = true` for the first `github_settings.max_projects` repositories by `pushed_at` and `false` for the rest.
- Update `github_settings.last_synced_at`.

**Step 6.2 — Endpoints.**
- `GET /api/admin/github/settings`, `PUT /api/admin/github/settings` — `username`, `max_projects`, `auto_sync`.
- `POST /api/admin/github/sync` — `requireOwner`, then `syncRepositories`. Returns `{ synced, created, updated, last_synced_at }`. Rate-limited implicitly by `gitHub`'s own API; also guarded by a 60-second server-side floor using `last_synced_at` to prevent accidental loops.
- `GET /api/admin/github/repositories` — paginated list with `q`, `featured`, `visible` filters.
- `PATCH /api/admin/github/repositories/[id]` — `is_featured`, `is_visible`, `display_order` only.
- `GET /api/cron/github-sync` — header `authorization: Bearer ${runtimeConfig.cronSecret}` required, else 401. Runs the sync when `github_settings.auto_sync` is true, then opportunistically deletes `ai_rate_limits` rows with `expires_at < now() - interval '1 day'`.

**Step 6.3 — `vercel.json`.** Vercel cron entries are the deployment's scheduler; Nuxt `nitro.scheduledTasks` is avoided because its Vercel behaviour is less explicit than a declared cron.

```json
{ "crons": [{ "path": "/api/cron/github-sync", "schedule": "0 */6 * * *" }] }
```

**Step 6.4 — Admin UI.** `app/pages/admin/projects.vue`: a settings block (username, max projects, auto-sync switch, `last_synced_at` caption, `[Sync now]` button with a pending state), then the repository table with columns name, language, stars, forks, pushed, featured toggle, visible toggle, order controls, and a GitHub link. Filter chips for all / featured / visible.

**Acceptance:** entering a username and pressing Sync writes rows sorted `pushed_at desc`; toggling Featured survives a second sync; `max_projects = 6` leaves exactly the six most recently pushed visible on first sync; the cron route returns 401 without `CRON_SECRET` and syncs with it.

---

## Phase 7 — Blog

**Step 7.1 — Editor component.** `app/components/admin/RichTextEditor.vue`, a leaf client component:
- `useEditor({ extensions: [StarterKit, Link.configure({ openOnClick: false }), Image, Placeholder.configure({ placeholder: 'Write the article…' })], immediatelyRender: false })` — `immediatelyRender: false` is required under SSR (the editor needs browser APIs).
- `v-model` emits `editor.getJSON()` (an object), matching `blog_posts.content jsonb`. Do not store HTML.
- Toolbar: bold, italic, strike, h2, h3, bullet list, ordered list, blockquote, code block, horizontal rule, link, image (uploads through `/api/admin/upload` into `blog-images`), undo/redo. Buttons are `Toggle`s with `aria-label` and `aria-pressed`; icons are `ph:*`.
- Loaded only on admin blog routes: `defineAsyncComponent(() => import('~/components/admin/RichTextEditor.vue'))`, plus `'/admin/**': { ssr: false }` already keeps it out of the server bundle.

**Step 7.2 — Public renderer.** `app/components/site/ArticleBody.vue` uses `useEditor({ editable: false, content: json, extensions: [...] })` with `immediatelyRender: false` inside `<ClientOnly>`, so the article body is rendered by the same TipTap schema that produced it and no separate JSON-to-Vue renderer is needed. The article's `prose` styles come from a scoped `:deep()` block in `ArticleBody.vue` sized to `measure-prose` (720px), with `pre` horizontally scrollable and `code` in `font-mono`. Because the body is client-rendered, the server-rendered page includes `title`, `excerpt`, and metadata — the SEO surface — while the body hydrates.

**Step 7.3 — Server routes.**
- `GET /api/admin/blog/posts` — paginated; filters `status`, `category`, `q`; returns posts with category and tag names.
- `POST /api/admin/blog/posts` — validates with `blogPostSchema`; `slug` is generated with `slugify(title)` then `uniqueSlug(slug, existingSlugs)` (query existing slugs for the same title prefix). Sets `author_id` from `requireOwner`. When `status === 'published'` and `published_at` is null, set `published_at = now()`. Upserts `blog_post_tags` from the payload's `tag_ids`. `excerpt` is required when publishing.
- `GET|PATCH|DELETE /api/admin/blog/posts/[id]` — same rules; PATCH re-runs the publish transition; DELETE cascades `blog_post_tags`.
- `GET /api/admin/blog/taxonomy` — categories and tags with counts.
- `POST /api/admin/blog/taxonomy` — create a category or tag, `slug` from `slugify(name)` uniquified as above.

**Step 7.4 — Admin UI.** `app/pages/admin/blog/index.vue` — table (title, category, status badge, published date, updated) with status filter chips, `[+ New article]`, and the empty state from `docs/DASHBOARD_DESIGN.md` §16. `app/pages/admin/blog/new.vue` and `blog/[id].vue` share `app/components/admin/BlogEditorShell.vue`: full-width title Input, toolbar, editor area (`min-h-[60dvh]`), and a right sidebar (`w-72`, below the editor on mobile) holding Category select, Tags input, Thumbnail upload, SEO fields (`meta_title`, `meta_description`), and Status. Action bar: `[Save draft]` (ghost) and `[Publish]` (primary), with a `[Schedule]`-free MVP (publishing is immediate) and a confirmation `AlertDialog` on unpublish. Autosave is not implemented; the draft button is explicit.

**Step 7.5 — Public pages.** `/blog` — category filter chips, 2-column card grid, "Load more" pagination of 9 per page. `/blog/[slug]` — category overline, `text-title` title, excerpt, published date, optional `thumbnail_url` hero, `ArticleBody`, then up to 3 related articles sharing the category. Unknown or unpublished slug → `createError({ statusCode: 404 })`.

**Acceptance:** create a draft → it is absent from `/blog`; publish → it appears at `/blog` and is readable at `/blog/[slug]` with formatted headings, lists, links, and a code block; a second article with the same title gets `-2` appended to its slug; deleting the post 404s its public URL.

---

## Phase 8 — AI providers, models, and the public API key

**Step 8.1 — Provider routes.**
- `GET /api/admin/router/providers` — never returns `secret_api_key`. Return `{ id, name, base_url, is_active, model_count, has_secret: boolean }`.
- `POST /api/admin/router/providers` — `{ name, base_url, secret_api_key, is_active }`; `base_url` must parse as an https URL. Validate with zod; trim a single trailing `/`.
- `PATCH /api/admin/router/providers/[id]` — `secret_api_key` present and non-empty → replace; absent or `null` → leave unchanged (so the masked form can be saved without re-entering the secret); empty string → reject with a 422 explaining that clearing requires deleting the provider.
- `DELETE /api/admin/router/providers/[id]` — refuse with 409 when `ai_models` rows reference it or when `ai_usage_logs` rows reference it (deactivate instead). The message states which one blocked it.
- `POST /api/admin/router/providers/[id]/test` — sends `POST {base_url}/models` with the stored secret and a 10 s `AbortSignal.timeout`, returns `{ ok, status, modelCount?, error? }`. Never returns the secret or the upstream body.

`app/pages/admin/router/providers.vue` renders one card per provider (`docs/DASHBOARD_DESIGN.md` §9): name, base URL, "N active models", a "Connected"/"Error" status from the last test, and `[Manage]`. The form masks the secret input as a password field with a reveal toggle, and the field is prefilled with a `••••••••` placeholder plus helper text "Leave unchanged to keep the current key."

**Step 8.2 — Model routes.** `GET|POST /api/admin/router/models`, `PATCH|DELETE /api/admin/router/models/[id]` — fields `provider_id`, `model_name`, `display_name`, `input_price`, `output_price`, `is_active`. Reject a `display_name` that collides case-insensitively with another row → 409 naming the conflicting model, because the router resolves clients by `display_name` and a collision would be ambiguous. `app/pages/admin/router/models.vue` — shadcn `Table` (Model, Provider, Status, Pricing, Actions) with all/active/inactive/provider filter chips; delete is confirmed.

**Step 8.3 — Public API key.**
- `GET /api/admin/router/api-key` — returns `{ id, key_prefix, label, is_active, last_used_at, created_at, revoked_at }`. Never the raw key and never the hash.
- `POST /api/admin/router/api-key` — generates `pk_portfolio_` + 32 characters from `crypto.getRandomValues` over the base62 alphabet. Stores `key_hash = sha256hex(raw)` and `key_prefix = raw.slice(0, 20)`. Revokes every previously active key (`revoked_at = now(), is_active = false`) in the same transaction-equivalent sequence. Returns the raw key **once** as `{ key, prefix }`; it is unrecoverable afterwards.
- `DELETE /api/admin/router/api-key/[id]` — sets `is_active = false, revoked_at = now()`.

`app/pages/admin/router/api-key.vue` shows the prefix, created date, last used, and the disabled/keyed states; `[Copy]`, `[Regenerate]`, `[Revoke]`. Regeneration opens an `AlertDialog` stating that the previous key stops working immediately. The one-time reveal is shown in a `Dialog` with the full key, a `CopyButton`, and an explicit "This key will not be shown again" warning.

**Step 8.4 — Router settings.** `GET|PUT /api/admin/router/settings` — `is_enabled`, `monthly_token_limit`, `requests_per_minute`, `requests_per_hour`, `requests_per_day`, `quota_exceeded_message`. All limits are integers ≥ 0, where 0 means unlimited. `app/pages/admin/router/index.vue` presents these as the router header + KPI + quota card from `docs/DASHBOARD_DESIGN.md` §8 (the KPI numbers themselves arrive in Phase 9).

**Step 8.5 — Shared router schema.** `shared/schemas/router.ts`:

```ts
export const routerRequestSchema = z.object({
  model: z.string().min(1).max(200),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant', 'tool']),
    content: z.union([z.string(), z.array(z.unknown())]),
  })).min(1).max(200),
}).loose()   // all other OpenAI-compatible fields pass through untouched
```

**Acceptance:** a provider can be created and tested; the secret never appears in any `/api/admin/**` response body or in the browser network tab; a model with a duplicate `display_name` is rejected with 409; regenerating the key invalidates the old one; the raw key is visible exactly once.

---

## Phase 9 — Public AI Router

**Step 9.1 — `POST /api/router`.** Order of operations is contractual — each check must short-circuit before the next, and every outcome writes a usage log row except a rejection before step 3 (there is no key to attribute it to).

| # | Check | Failure |
|---|---|---|
| 1 | `content-length > 131072` | `413 payload_too_large` |
| 2 | Bearer token from `Authorization: Bearer <k>` or `x-api-key` | `401 invalid_api_key` |
| 3 | `sha256hex(token)` matches `ai_api_keys.key_hash` where `is_active and revoked_at is null` | `401 invalid_api_key` |
| 4 | `ai_router_settings.is_enabled` | `403 router_disabled` |
| 5 | `ai_rate_limit_hit(identifier = key_prefix, 'minute' \| 'hour' \| 'day', window seconds, limit)` for each window whose limit > 0 | `429 rate_limited`, `Retry-After: <seconds to reset_at>` |
| 6 | Month-to-date `sum(total_tokens)` from `ai_usage_logs` (`created_at >= date_trunc('month', now())`) `< monthly_token_limit` | `402 quota_exceeded`, message `quota_exceeded_message` |
| 7 | Body matches `routerRequestSchema` | `422 invalid_request` with the zod issue paths |
| 8 | `ai_models` where `lower(display_name) = lower(body.model)` | `404 model_not_found`; row with `is_active = false` → `404 model_inactive` |
| 9 | Provider row for the model has `is_active` | `502 provider_inactive` |
| 10 | `POST {provider.base_url}/chat/completions`, `Authorization: Bearer {secret_api_key}`, body `{ ...rest, model: model.model_name }`, `AbortSignal.timeout(60_000)` | network/timeout → `502 upstream_error` |
| 11 | Upstream `!response.ok` | `502 upstream_error` |
| 12 | Record usage | — |

Error body is always `{ "error": { "code": string, "message": string, "request_id": string } }`. Codes: `payload_too_large`, `invalid_api_key`, `router_disabled`, `rate_limited`, `quota_exceeded`, `invalid_request`, `model_not_found`, `model_inactive`, `provider_inactive`, `upstream_error`. `request_id` is `crypto.randomUUID()` created at the top of the handler and echoed in the `x-request-id` response header so a failure can be matched to its log row.

On success: parse `usage.prompt_tokens`, `usage.completion_tokens`, `usage.total_tokens` (fall back to `prompt + completion`, then `0`); insert `ai_usage_logs` with `status_code`, `latency_ms` (`performance.now()` delta), and `error_code` when relevant; update `ai_api_keys.last_used_at`; return the upstream JSON body **verbatim** (clients expect the OpenAI response shape) with `x-request-id` attached. Streaming is not implemented — `docs/MVP.md` §7 lists it as post-MVP; a request with `stream: true` is passed through but the response is buffered, and this is stated in the `/router` page copy.

Rate limiting runs before quota so a broken client cannot burn a DB aggregate query per request.

**Step 9.2 — `GET /api/router/info`.** Public, no auth, no caching-sensitive data: `{ enabled, endpoint, key_prefix, models: [{ display_name, provider_name }], quota: { limit, used, remaining } }`. Only active models on active providers are listed; `key_prefix` is omitted entirely when no active key exists. This is the public read path for `ai_router_settings`, which has no anon policy.

**Step 9.3 — `/router` page.** `app/pages/router.vue`, structured per `docs/WEB_PORTOFOLIO_DESIGN.md` §15: "AI Router / One endpoint. Multiple AI providers." header with a `StatusDot` reading Operational; the endpoint URL in `font-mono` with a `CopyButton`; the public key prefix with a `CopyButton`; a `Progress` quota bar with `formatNumber` values and remaining tokens; the available-model list (display name, provider, availability dot); and the `curl` example in a code block with a copy button. Page copy states plainly that the public key is intentionally shareable and that provider secrets are never published.

When `enabled` is false the page renders a composed "Router is currently unavailable." state and the nav item is already gone (Step 5.1).

**Step 9.4 — Unit test.** Extend `tests/unit/shared-utils.test.ts` with the token-accounting helper extracted to `shared/utils/usage.ts`:

```ts
export function parseUsage(raw: unknown): { input_tokens: number; output_tokens: number; total_tokens: number }
```

Assertions: `{ prompt_tokens: 10, completion_tokens: 5 }` → `{ 10, 5, 15 }`; `{ total_tokens: 99 }` alone → `{ 0, 0, 99 }`; `{}` → all zeros; `{ prompt_tokens: 10, completion_tokens: 5, total_tokens: 5 }` → trusts the explicit `total_tokens`. Mixed and absent `usage` objects are the common upstream reality, and getting this wrong silently mis-bills the quota.

**Step 9.5 — End-to-end probe script.** `scripts/router-probe.mjs` — a plain Node script (no framework) run manually against a running dev server. It reads `ROUTER_KEY` and `ROUTER_BASE` from the environment and asserts, printing one line per case:

| Case | Expected |
|---|---|
| valid key, active model, small message | `200`, body has `choices`, `x-request-id` present |
| key `pk_portfolio_invalid` | `401`, `error.code === 'invalid_api_key'` |
| active key, `model: "does-not-exist"` | `404`, `error.code === 'model_not_found'` |
| `requests_per_minute = 2`, three rapid calls | third is `429` with a `Retry-After` header |
| `monthly_token_limit` set below month-to-date usage | `402`, message equals `quota_exceeded_message` |
| `is_enabled = false` | `403`, `error.code === 'router_disabled'` |
| `Content-Length` over 128 KB | `413` |

After the run, the script queries `ai_usage_logs` through the Supabase URL + service key and asserts a row exists for each 200/402/429/404/502 outcome with a non-null `request_id`.

**Acceptance:** `node scripts/router-probe.mjs` prints all seven cases passing, and `ai_usage_logs` contains one row per attempted request with matching `status_code` and `request_id`.

---

## Phase 10 — Analytics

**Step 10.1 — Ingest.** `POST /api/analytics/collect`, no auth, always returns `204` and never throws to the client (the whole body is wrapped in `try/catch`; failures are logged server-side only).

Body: `{ path: string, title?: string, referrer?: string, event?: string, metadata?: object, duration_ms?: number }`, validated with zod. Unknown or oversized fields are dropped rather than rejected.

Resolution order:
1. `isBot(user-agent)` → return 204 without writing.
2. `ip = getRequestIP(event, { xForwardedFor: true }) ?? ''`; `visitorHash = sha256hex(`${ip}|${userAgent ?? ''}|${runtimeConfig.analyticsSalt}`)`. Raw IP is used in-memory only and is never persisted. `ponytail:` note inline — the salt is stable so unique-visitor maths works across periods; rotating it is a deliberate bulk-reset operation, so keep `NUXT_ANALYTICS_SALT` stable and treat rotation as a migration.
3. Upsert `analytics_visitors` on `visitor_hash`, setting `last_seen_at = now()`. On insert only, populate `country` from `x-vercel-ip-country`, `region` from `x-vercel-ip-country-region`, and `device_type`/`browser`/`os` from `parseUserAgent(userAgent)` refined by Client Hints headers when present (`sec-ch-ua-mobile`, `sec-ch-ua-platform` override the regex guess).
4. Session: read cookie `wp_sid`. Absent, or its `analytics_sessions.last_activity_at` is older than 30 minutes → insert a new session with `landing_page = path`, `referrer`, and set the cookie (`httpOnly: true`, `sameSite: 'lax'`, `secure: !import.meta.dev`, `maxAge: 1800`). Otherwise update `last_activity_at = now()` and `exit_page = path`.
5. If `event` is absent or `'page_view'` → insert `analytics_pageviews` with `duration_ms` when supplied. Otherwise insert `analytics_events` with `event_name = event` and `metadata`. The event name must be in the allowlist from `docs/PRD.md` §7.14 (`page_view`, `cv_download`, `github_click`, `social_click`, `project_view`, `blog_view`, `contact_submit`, `ai_router_request`); anything else is stored as `custom:<name>` so the dashboard never has to guess.

**Step 10.2 — Client.** `app/plugins/analytics.client.ts`:
- On router `afterEach`, record the departing page's dwell time, then send `{ path, title, referrer, duration_ms }` for the new page.
- `app/composables/useTrackEvent.ts` exports `trackEvent(name, metadata?)`, used by `CvDownload`, GitHub links, social links, project cards, blog cards, and the contact CTA.
- Transport: `navigator.sendBeacon('/api/analytics/collect', blob)` when available, else `$fetch(..., { method: 'POST', keepalive: true })`. Payload under 64 KB.
- Disabled entirely when `document.documentElement.dataset.track === 'off'`; `app/pages/privacy.vue` explains what is collected (page path, referrer, device class, country, a salted one-way visitor hash) and offers a "Do not track me" switch that sets that flag in `localStorage`. `docs/MVP.md` §2 requires a privacy posture but names no page; `/privacy` is the standard surface for it and is linked from the footer.

**Step 10.3 — Aggregation routes.** All `requireOwner`.

| Route | Query | Returns |
|---|---|---|
| `GET /api/admin/dashboard/overview` | — | visitors, page views, sessions (with period-over-period deltas), blog post count, project count, AI request count, AI tokens, remaining quota, router enabled |
| `GET /api/admin/analytics/timeseries` | `from`, `to`, `granularity` (`day`\|`week`) | `[{ date, visitors, pageviews, sessions }]` |
| `GET /api/admin/analytics/top-pages` | `from`, `to`, `limit` | `[{ path, views, visitors }]` |
| `GET /api/admin/analytics/sources` | `from`, `to` | `[{ referrer, visitors, percentage }]` |
| `GET /api/admin/analytics/devices` | `from`, `to` | `{ device_type: count }` and `{ browser: count }` and `{ os: count }` |
| `GET /api/admin/analytics/geo` | `from`, `to` | `[{ country, visitors }]` |
| `GET /api/admin/analytics/events` | `from`, `to` | `[{ event_name, count }]` |

Periods: `Today`, `Yesterday`, `Last 7 Days`, `Last 30 Days`, `Last 90 Days` (`docs/MVP.md` §3). Implement as a `resolvePeriod(range): { from: Date; to: Date }` helper in `shared/utils/period.ts` used by every analytics route, so the boundaries cannot drift between charts. Paid/token aggregates use `sum(total_tokens)` and `avg(latency_ms)` over the same period.

**Step 10.4 — Chart components.** `app/components/charts/` — each is a leaf client component, loaded with `defineAsyncComponent` so no chart code is in any page's initial bundle.

| Component | Unovis composition |
|---|---|
| `VisitorTrendChart.vue` | `VisXYContainer` + `VisLine` + `VisAxis` (x date, y count) + `VisCrosshair` + `VisTooltip` inside `<ClientOnly>` with a `Skeleton` fallback at the container's exact height |
| `TrafficSourceChart.vue` | `VisXYContainer` + `VisGroupedBar` |
| `RouterUsageChart.vue` | `VisXYContainer` + `VisArea` + `VisAxis`, tokens per day |
| `TopPagesTable.vue` | shadcn `Table`, not a chart |

Chart colours come from `--chart-1..5`; axes and grid lines use `--border`; labels use `text-caption` in `font-mono`. Device and browser breakdowns are compact `divide-y` rows, not charts and not cards (`docs/DASHBOARD_DESIGN.md` §7).

**Step 10.5 — Dashboard pages.** `app/pages/admin/dashboard.vue` — KPI row (Visitors, Page Views, AI Requests, AI Tokens with `used %`), then blog posts / projects / sessions / router status, then the visitor trend line, then top pages and traffic sources side by side at `lg`, then devices, browsers, OS, and country as compact rows. Period selector as `Toggle`s at the top, feeding every panel. Each KPI is a bordered surface grouped with `divide-x` at `lg` and `divide-y` below — not a grid of floating cards. Every number renders in `font-mono`.

`app/pages/admin/analytics.vue` — the same panels plus geo and custom events, with the period selector and a `[Export CSV]` action generating the file client-side from the current view's data.

`app/pages/admin/router/usage.vue` and `router/logs.vue` — `docs/DASHBOARD_DESIGN.md` §12 and §13. Usage shows requests today, requests this month, input/output/total tokens, average latency, error rate, with date/provider/model/status filters (`GET /api/admin/router/usage`). Logs is a dense paginated table (Time, Request ID, Provider, Model, Tokens, Status, Latency) with row-click opening a `Sheet` of the log's own columns — prompt and response are not stored, and the Sheet says so. Virtualization is unnecessary at `pageSize = 50`; the `ponytail:` note records that list virtualization is the upgrade path if a single month exceeds roughly 5,000 rows.

**Step 10.6 — Recommended indexes are already in Phase 1.** Confirm the analytics routes use `analytics_pageviews(viewed_at)`, `analytics_pageviews(path, viewed_at)`, `analytics_sessions(started_at)`, `analytics_events(event_name, created_at)`, and `ai_usage_logs(created_at)` / `(model_id, created_at)`.

**Acceptance:** visiting `/`, `/projects`, and `/blog/[slug]` in a browser writes three `analytics_pageviews` rows tied to one visitor and one session; the dashboard shows those numbers for `Today`; a CV download adds a `cv_download` row to `analytics_events`; changing the period changes every panel consistently; the AI usage page reflects the Phase 9 probe run's rows.

---

## Phase 11 — Website settings, navigation, maintenance, SEO

**Step 11.1 — Settings routes.** `GET|PUT /api/admin/settings/site` — `site_name`, `logo_url`, `favicon_url`, `meta_title`, `meta_description`, `og_image_url`, `maintenance_mode`. `GET|PUT /api/admin/settings/navigation` and the reorder endpoint from the generic resource layer — `label`, `path`, `icon`, `display_order`, `is_visible`, `is_external`.

**Step 11.2 — Admin UI.** `app/pages/admin/website.vue` — General (site name, logo upload, favicon upload), Navigation (ordered editable list with visibility toggles, drag handles wired to `reorder`, and an add dialog with an icon picker limited to the `ph` collection), SEO (meta title, meta description, OG image upload with a live preview of the resulting card), Maintenance (a switch with an `AlertDialog` confirming that the public site will be hidden).

`app/pages/admin/settings.vue` — Account (display name, avatar, email read-only with a "change email" note pointing at Supabase Auth), Security (change password via `auth.updateUser`, and a "sign out everywhere" action via `auth.signOut({ scope: 'global' })`).

**Step 11.3 — Maintenance mode.** `app/middleware/maintenance.global.ts`: when `site_settings.maintenance_mode` is true and the path does not start with `/admin`, render the maintenance page instead of the route. Read the flag from a `useState`-cached `useAsyncData` on `site_settings` so it costs one query per session, not per navigation. `/api/router` is unaffected — the router is a separate toggle (`docs/WEB_PORTOFOLIO_DESIGN.md` §19 says the two are independent).

**Step 11.4 — Router visibility.** Already wired in Step 5.1 (`useNavigation()` drops the `/router` item when the router is disabled). Confirm `/router` still resolves directly when disabled, showing the unavailable state rather than a 404.

**Step 11.5 — Favicon and OG.** `nuxt.config.ts` `app.head` reads `site_settings` at runtime through `useHead` in `app/app.vue` rather than static config, since these values are Owner-editable: `link rel="icon"` from `favicon_url`, `og:image` from `og_image_url`, `title` template `%s — {site_name}`.

**Acceptance:** renaming the site updates the header, footer, and `<title>` on every page; hiding a nav item removes it from the public nav; the icon picker's selection renders on the public nav; enabling maintenance mode makes `/` show the maintenance page while `/admin/dashboard` still works and `/api/router` keeps responding; the favicon and OG image come from the uploaded files.

---

## Phase 12 — Hardening, performance, and deployment

**Step 12.1 — Security pass.**
- `pnpm audit --prod`; resolve high and critical findings.
- `grep -rn "supabaseSecretKey\|NUXT_SUPABASE_SECRET_KEY\|secretApiKey\|secret_api_key" app/` must return **zero** matches. Any hit means a secret is reachable from the client bundle.
- Confirm every `/api/admin/**` handler's first statement is `await requireOwner(event)`.
- Confirm `server/api/router.post.ts` never logs or returns `secret_api_key`, and that error responses never include upstream bodies.
- Add `routeRules` response headers: `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin`, `x-frame-options: DENY` for `/admin/**`, and a `content-security-policy` that permits `'self'` plus the Supabase origin.
- Verify `robots.txt` disallows `/admin` and `/api`.

**Step 12.2 — Performance pass.**
- `pnpm build` then `pnpm preview`; Lighthouse mobile on `/`, `/projects`, `/blog` — target ≥ 90 Performance, ≥ 95 Accessibility, ≥ 95 Best Practices, ≥ 95 SEO.
- Confirm `/admin/**` is absent from the server bundle (route rule `ssr: false`) and that `@unovis/*` and `@tiptap/*` appear in no public route's initial chunk.
- Confirm no request to `fonts.googleapis.com` or `fonts.gstatic.com` (self-hosted by `@nuxt/fonts`).
- Confirm hero and section images use explicit `width`/`height` and `loading="lazy"` below the fold.
- Verify the noise/grain treatment, if any is used, is on a `fixed inset-0 pointer-events-none` pseudo-element and never on a scrolling container.

**Step 12.3 — Accessibility pass.** Keyboard-only walk of `/` and `/admin/dashboard`: every interactive control reachable and visibly focused (`--ring`), the drawer and dialogs trap focus and restore it on close, `⌘K` open/close is announced, every image has meaningful `alt` (decorative images `alt=""`), heading order is sequential on every page, and a `prefers-reduced-motion: reduce` session shows no entrance animation.

**Step 12.4 — Deploy.** Create the Vercel project, set every `.env.example` variable in Production and Preview (`NUXT_PUBLIC_SITE_URL` must be the real origin so `resetPasswordForEmail` and the PKCE callback resolve), add the Supabase production redirect URL, and confirm `vercel.json`'s cron is registered. Run the migrations against the production Supabase project in filename order, run `supabase/seed.sql`, and bootstrap the production Owner via `scripts/bootstrap-owner.sql`.

**Acceptance:** the production URL serves the portfolio, the Owner can log in and manage content, `/api/router` answers `curl` with a real key, `ai_usage_logs` grows, and the dashboard analytics reflect real traffic.

---

## Critical files & anchors

| Path | What it holds |
|---|---|
| `nuxt.config.ts` | Module list, route rules, runtime config, Supabase redirect policy. Every later phase assumes these exact keys. |
| `app/assets/css/tailwind.css` | The only source of colour, type, radius, and shadow tokens. Every component class resolves here. |
| `server/api/router.post.ts` | The public gateway. Its check order and error `code` literals are contractual and are asserted by `scripts/router-probe.mjs`. |
| `server/utils/resources.ts` | The resource registry that makes six CMS screens one implementation. Adding a resource means adding a row here, not four route files. |
| `supabase/migrations/20260917000005_ai_router.sql` | `ai_rate_limit_hit()` plus the router indexes and RLS. Correctness of quota and rate limiting lives entirely in this file. |

---

## Verification

Run after each phase; the whole list before declaring the project done. All commands run from the repository root with `.env` populated.

**Toolchain and unit checks**

```bash
pnpm install
pnpm typecheck                 # expects no errors
pnpm test                      # expects all node:test assertions passing
pnpm build                     # expects a clean production build
```

**Database**

- Apply all seven migrations to a fresh Supabase project and run `supabase/seed.sql`; both must complete without error.
- `select * from ai_rate_limit_hit('probe','minute',60,2)` called three times returns `allowed = true, true, false`.
- As `anon`, `select * from ai_providers` returns zero rows; as `anon`, `select * from experiences where is_visible` returns only visible rows.
- `select count(*) from ai_router_settings` returns `1`; a second `insert` fails on the singleton index.

**Owner flow (manual, browser)**

1. `pnpm dev`, open `/admin/dashboard` → redirected to `/admin/login`.
2. Log in as the seeded Owner → dashboard shell renders; `⌘K` opens the command menu.
3. Create an experience; toggle its visibility off and on; reorder two rows; upload an avatar; delete a row.
4. Create a blog article, save as draft, then publish.
5. Add a provider with a real key, run the connection test, add a model, generate the public key, copy it from the one-time dialog.

Expected: every public page reflects each change within the SWR window (≤ 10 minutes), and no admin response body ever contains a secret.

**Public flow (manual, browser)**

1. `/` renders the hero, hides empty sections, and shows nav items from `navigation_items`.
2. Every nav item navigates without a full page reload; the `/router` item disappears when `is_enabled` is set to false.
3. `/blog/[slug]` renders headings, lists, links, and a horizontally scrollable code block within a 720px measure.
4. `/cv` produces a signed URL that downloads the PDF; the download increments `cv_download` events.
5. Mobile viewport (375px): no horizontal scroll on any page, the nav drawer opens and traps focus.
6. Dark mode toggle flips the theme on every page with no flash after reload.

**AI Router (scripted)**

```bash
ROUTER_BASE=http://localhost:3000 ROUTER_KEY=pk_portfolio_... node scripts/router-probe.mjs
```

Expected: seven passing cases; then `ai_usage_logs` holds one row per attempted request with a matching `status_code` and a distinct `request_id`; `ai_api_keys.last_used_at` is populated.

**Analytics**

- Visit `/`, `/projects`, and one article in a single browser session, then query `analytics_pageviews` → three rows sharing one `session_id` and one `visitor_id`, with distinct `path` values.
- Re-request `/api/analytics/collect` with `User-Agent: Googlebot/2.1` → `204` and no new row.
- The dashboard `Today` period shows the same counts as a direct `count(*)` on the tables.
- `analytics_visitors` contains no column holding a raw IP.

**Deployment**

- Production build serves `/` with Lighthouse mobile ≥ 90 / 95 / 95 / 95.
- DevTools network panel on `/` shows no request to `fonts.googleapis.com`, `fonts.gstatic.com`, `unpkg.com`, or `cdn.jsdelivr.net`.
- The Vercel cron fires `/api/cron/github-sync` and `github_settings.last_synced_at` advances.

---

## Assumptions & contingencies

**Assumptions** (all user-overridable; each has a default already chosen):

1. **Owner identity and branding.** Seed values use `Hafiz Agha Al-Baith` / `Software Engineer & Founder` from `docs/WEB_PORTOFOLIO_DESIGN.md` §18. The Owner edits them in the dashboard; no source change is needed.
2. **Accent colour is emerald** (`oklch(0.44 0.09 168)`). Changing it means editing `--primary`, `--ring`, `--chart-1`, and the four `--sidebar-primary*` values in `tailwind.css` — nothing else references a colour literal.
3. **AI providers speak the OpenAI-compatible chat API** (`POST {base_url}/chat/completions` returning `usage`). `docs/PRD.md` §7.10 describes generic `base URL` + `secret key` providers and §7.11 lists both OpenAI and Gemini as models, which is consistent with Gemini's OpenAI-compatibility endpoint. A provider that speaks a different wire format requires a per-provider adapter in `server/utils/providers/` and a `format` column on `ai_providers`.
4. **Rate limiting stays in Postgres** via `ai_rate_limits` + `ai_rate_limit_hit()`. `docs/MVP.md` §7 defers Redis/Upstash; migrate when the router sustains more than roughly 50 requests/second, at which point `ai_rate_limit_hit` is replaced by an Upstash call and the table becomes a fallback log.
5. **Public key validation is a SHA-256 hash lookup**, not bcrypt. The key is 32 characters of CSPRNG output, so it is not brute-forceable; bcrypt would add per-request cost for no gain.
6. **No `contact_messages` table and no email provider** — the contact page is email + socials + a mailto CTA (Step 5.9).
7. **Blog publishing is immediate**; scheduling is not in `docs/MVP.md` §6.
8. **`/privacy` is added** even though the PRD's IA omits it, because the analytics consent switch needs a home.
9. **The dashboard renders client-side** (`/admin/**': { ssr: false }`). This keeps TipTap and Unovis out of the server bundle and simplifies auth; admin SEO is irrelevant.

**Contingencies** — pre-decided so execution never stalls:

- **`shadcn-vue init` is interactive despite `-y`.** Accept every default, then overwrite `app/assets/css/tailwind.css` in Step 2.1 and verify `components.json` has `tailwind.cssVariables: true` and `tailwind.baseColor: "neutral"`. If `--base reka` is rejected by the installed CLI version, drop it and keep `--icon-library phosphor --font geist`.
- **`@nuxt/icon` cannot resolve `@iconify-json/ph`.** Switch `icon.mode` to `'css'`. This adds one iconify CDN request per distinct icon name; acceptable, but prefer fixing the install first (`pnpm add -D @iconify-json/ph`).
- **Unovis SSR or hydration errors.** Every chart component already sits inside `<ClientOnly>`; if errors persist, move `@unovis/vue` imports inside `onMounted` inside the leaf component rather than importing at module scope.
- **`swr` route rules cause stale public content during development.** Set `swr` to a small value (or omit) in `nuxt.config.ts` while developing Phase 4–7, and restore the listed values before Phase 12. The mechanism itself is correct.
- **Supabase CLI is unavailable (no Docker).** Apply the seven migration files in filename order through the Supabase SQL editor, then run `seed.sql` and `bootstrap-owner.sql`. `pnpm dlx supabase gen types` still works against the hosted project and needs no Docker, so `app/types/database.types.ts` is still generated normally.
- **`pnpm` cannot resolve a Nuxt transitive dependency.** Add `.npmrc` with `shamefully-hoist=true` and reinstall. Do not add it pre-emptively.
- **A provider rejects the forwarded request body** because it dislikes a pass-through field. Add that field to an explicit strip-list in `server/api/router.post.ts`; do not start whitelisting fields, since the schema intentionally passes extras through.
- **The GitHub account exceeds 300 repositories.** Raise the page cap in `syncRepositories`; the mapping and upsert logic are unaffected.
- **Quota check races under concurrent requests.** This is accepted: the check is soft by design (`docs/MVP.md` §6 only requires that exhausted quota is refused). If exact enforcement is needed later, wrap the check and the usage insert in a single `security definer` RPC that takes an advisory lock per month.
