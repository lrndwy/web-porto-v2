# MVP --- Personal Developer Portfolio Platform

## 1. MVP Objective

MVP bertujuan menghasilkan versi pertama yang sudah usable untuk
production:

-   public portfolio,
-   owner CMS,
-   GitHub project integration,
-   blog WYSIWYG,
-   AI Router multi-provider,
-   token quota,
-   analytics dasar,
-   deployment Vercel.

## 2. MVP Scope

### Phase 1 --- Foundation

-   Nuxt project
-   TypeScript
-   Tailwind CSS
-   shadcn-vue
-   Supabase integration
-   environment configuration
-   basic layout
-   error handling
-   loading state

### Phase 2 --- Owner Authentication

-   Supabase Auth
-   Owner bootstrap
-   admin login
-   logout
-   protected admin routes
-   role checking
-   password reset
-   RLS

Owner tidak dibuat melalui public registration.

### Phase 3 --- Portfolio CMS

Implementasi CRUD:

-   Profile
-   Experience
-   Achievement
-   Education
-   Social Media
-   Documents

Fitur umum:

-   create
-   edit
-   delete
-   visibility
-   order
-   image/file upload

### Phase 4 --- Public Portfolio

Halaman:

-   Home
-   About
-   Experience
-   Achievement
-   Education
-   Projects
-   Blog
-   Router
-   Contact

Home menampilkan ringkasan:

-   profile
-   title
-   short description
-   selected experience
-   selected projects
-   latest articles
-   social links
-   CV CTA

### Phase 5 --- GitHub Integration

Owner:

-   input username,
-   sync repositories,
-   configure maximum displayed repositories,
-   feature/unfeature project.

Public:

-   latest projects,
-   repository URL,
-   description,
-   language,
-   stars,
-   forks,
-   last pushed date.

Gunakan server API dan caching.

### Phase 6 --- Blog

MVP blog:

-   create article,
-   edit article,
-   delete article,
-   draft,
-   publish,
-   slug,
-   category,
-   tags,
-   thumbnail,
-   WYSIWYG content,
-   public blog list,
-   public blog detail.

### Phase 7 --- AI Router

MVP provider:

-   add provider,
-   edit provider,
-   delete/disable provider,
-   secret API key,
-   base URL,
-   provider status.

MVP model:

-   add model,
-   connect to provider,
-   active/inactive,
-   display name.

Router:

`POST /api/router`

Validation:

-   router enabled,
-   public API key valid,
-   model active,
-   quota available,
-   rate limit available.

### Phase 8 --- Public API Key

Generate one key:

`pk_uhuy_<random>`

Capabilities:

-   copy,
-   masked display,
-   regenerate,
-   revoke.

Regeneration invalidates the previous key.

### Phase 9 --- AI Usage

Track:

-   request count,
-   input tokens,
-   output tokens,
-   total tokens,
-   model,
-   provider,
-   status,
-   latency,
-   timestamp.

Owner dapat melihat:

-   daily usage,
-   monthly usage,
-   remaining quota,
-   top models,
-   failed requests.

### Phase 10 --- Analytics

MVP analytics:

-   unique visitors,
-   page views,
-   sessions,
-   top pages,
-   traffic referrer,
-   device type,
-   browser,
-   OS,
-   country/region,
-   CV download,
-   GitHub click,
-   social click.

Tambahkan anonymous visitor ID dan session ID.

Jangan menyimpan raw IP secara permanen.

### Phase 11 --- Website Settings

-   site name
-   favicon
-   logo
-   SEO title
-   SEO description
-   OG image
-   navigation visibility/order
-   maintenance mode
-   router visibility

## 3. MVP Dashboard

Dashboard overview minimal memiliki:

-   total visitors,
-   page views,
-   sessions,
-   blog posts,
-   projects,
-   AI requests,
-   AI tokens,
-   remaining quota,
-   router status.

Analytics memiliki date filter:

-   Today
-   Yesterday
-   Last 7 Days
-   Last 30 Days
-   Last 90 Days

## 4. MVP Security

Wajib:

-   Supabase Auth
-   protected admin routes
-   role-based authorization
-   RLS
-   server-only provider secrets
-   server-only service role key
-   API key hashing/secure storage strategy
-   rate limiting
-   quota validation
-   input validation
-   CORS policy yang sesuai
-   request size limit

## 5. MVP Performance

-   SSR/SSG sesuai kebutuhan page,
-   cache GitHub response,
-   optimized image,
-   lazy-load WYSIWYG/editor,
-   minimize client-side state,
-   pagination untuk admin tables,
-   database indexes,
-   avoid unnecessary realtime subscriptions.

## 6. MVP Acceptance Criteria

### Authentication

-   [ ] Owner dapat login.
-   [ ] User unauthenticated diarahkan ke login.
-   [ ] User non-authorized mendapat 403.
-   [ ] Logout bekerja.
-   [ ] Password reset bekerja.

### CMS

-   [ ] Semua content dapat dikelola dari dashboard.
-   [ ] Visibility bekerja.
-   [ ] Order bekerja.
-   [ ] Upload file bekerja.

### GitHub

-   [ ] Username dapat disimpan.
-   [ ] Repository dapat disinkronkan.
-   [ ] Sorting pushed desc bekerja.
-   [ ] Featured project bekerja.

### Blog

-   [ ] WYSIWYG bekerja.
-   [ ] Draft bekerja.
-   [ ] Publish bekerja.
-   [ ] Slug unik.
-   [ ] Blog public dapat dibaca.

### AI Router

-   [ ] Provider dapat dibuat.
-   [ ] Model dapat dibuat.
-   [ ] Public API key dapat dibuat.
-   [ ] Request valid diteruskan.
-   [ ] Model inactive ditolak.
-   [ ] Invalid key ditolak.
-   [ ] Quota habis ditolak.
-   [ ] Rate limit bekerja.
-   [ ] Usage tercatat.

### Analytics

-   [ ] Page view tercatat.
-   [ ] Unique visitor dapat dihitung.
-   [ ] Session dapat dihitung.
-   [ ] Top pages tersedia.
-   [ ] Event dasar tersedia.
-   [ ] Dashboard analytics menampilkan data.

## 7. Post-MVP

Fitur berikut tidak wajib pada MVP:

-   multi-user collaboration,
-   MFA,
-   Redis distributed rate limiting,
-   advanced analytics funnel,
-   visitor live map,
-   email newsletter,
-   comments,
-   search engine,
-   AI streaming untuk semua provider,
-   automatic model discovery,
-   provider health monitoring,
-   backup/export,
-   API documentation portal,
-   API usage per-client key,
-   multiple public API keys,
-   custom domains.

## 8. Recommended Implementation Order

1.  Foundation
2.  Supabase schema
3.  Authentication
4.  Admin layout
5.  Portfolio CMS
6.  Public portfolio
7.  GitHub integration
8.  Blog
9.  AI provider/model management
10. Public AI Router
11. Quota/rate limit
12. AI usage analytics
13. Website analytics
14. Website settings
15. Security hardening
16. Performance optimization
17. Vercel deployment
