# Supabase Schema --- Personal Developer Portfolio Platform

## 1. Schema Principles

Database dibagi menjadi:

``` text
Identity
├── auth.users
└── user_profiles

Portfolio
├── profiles
├── experiences
├── achievements
├── educations
├── socials
└── documents

Content
├── blog_categories
├── blog_tags
├── blog_posts
└── blog_post_tags

GitHub
├── github_settings
└── github_repositories

AI Router
├── ai_router_settings
├── ai_providers
├── ai_models
├── ai_api_keys
├── ai_usage_logs
└── ai_rate_limits

Analytics
├── analytics_visitors
├── analytics_sessions
├── analytics_pageviews
└── analytics_events

Website
├── site_settings
└── navigation_items
```

## 2. Identity

### `user_profiles`

  Column         Type          Description
  -------------- ------------- --------------------------
  id             uuid PK       references auth.users.id
  display_name   text          nama user
  role           text          OWNER/ADMIN/EDITOR
  avatar_url     text          avatar
  created_at     timestamptz   created
  updated_at     timestamptz   updated

Constraint:

``` sql
check (role in ('OWNER', 'ADMIN', 'EDITOR'))
```

Owner pertama dibuat melalui Supabase Auth. Role disimpan pada
`user_profiles`.

## 3. Portfolio

### `profiles`

  Column              Type
  ------------------- ---------------
  id                  uuid PK
  name                text
  title               text
  short_description   text
  description         text
  avatar_url          text
  location            text
  email               text
  phone               text nullable
  github_username     text
  website_url         text nullable
  is_visible          boolean
  created_at          timestamptz
  updated_at          timestamptz

### `experiences`

  Column          Type
  --------------- ---------------
  id              uuid PK
  title           text
  organization    text
  description     text
  location        text nullable
  start_date      date
  end_date        date nullable
  is_current      boolean
  logo_url        text nullable
  display_order   integer
  is_visible      boolean
  created_at      timestamptz
  updated_at      timestamptz

### `achievements`

  Column             Type
  ------------------ ---------------
  id                 uuid PK
  title              text
  issuer             text
  description        text nullable
  achievement_date   date nullable
  certificate_url    text nullable
  image_url          text nullable
  display_order      integer
  is_visible         boolean
  created_at         timestamptz
  updated_at         timestamptz

### `educations`

  Column          Type
  --------------- ---------------
  id              uuid PK
  institution     text
  degree          text
  field           text
  description     text nullable
  start_date      date
  end_date        date nullable
  logo_url        text nullable
  display_order   integer
  is_visible      boolean
  created_at      timestamptz
  updated_at      timestamptz

### `socials`

  Column          Type
  --------------- ---------------
  id              uuid PK
  platform        text
  username        text nullable
  url             text
  icon            text nullable
  display_order   integer
  is_visible      boolean
  created_at      timestamptz
  updated_at      timestamptz

### `documents`

  Column       Type
  ------------ ---------------
  id           uuid PK
  name         text
  file_path    text
  file_type    text
  file_size    bigint
  version      text nullable
  is_active    boolean
  is_visible   boolean
  created_at   timestamptz
  updated_at   timestamptz

## 4. Blog

### `blog_categories`

  Column        Type
  ------------- ---------------
  id            uuid PK
  name          text
  slug          text UNIQUE
  description   text nullable
  created_at    timestamptz

### `blog_tags`

  Column       Type
  ------------ -------------
  id           uuid PK
  name         text
  slug         text UNIQUE
  created_at   timestamptz

### `blog_posts`

  Column             Type
  ------------------ ----------------------
  id                 uuid PK
  author_id          uuid FK
  category_id        uuid FK nullable
  title              text
  slug               text UNIQUE
  excerpt            text nullable
  content            jsonb
  thumbnail_url      text nullable
  status             text
  published_at       timestamptz nullable
  meta_title         text nullable
  meta_description   text nullable
  created_at         timestamptz
  updated_at         timestamptz

Status:

``` text
draft
published
archived
```

### `blog_post_tags`

  Column    Type
  --------- ---------
  post_id   uuid FK
  tag_id    uuid FK

Primary key:

``` text
(post_id, tag_id)
```

## 5. GitHub

### `github_settings`

  Column           Type
  ---------------- ----------------------
  id               uuid PK
  username         text
  max_projects     integer
  auto_sync        boolean
  last_synced_at   timestamptz nullable
  created_at       timestamptz
  updated_at       timestamptz

### `github_repositories`

  Column          Type
  --------------- ---------------
  id              uuid PK
  github_id       bigint UNIQUE
  name            text
  full_name       text
  description     text nullable
  html_url        text
  homepage_url    text nullable
  language        text nullable
  stars           integer
  forks           integer
  pushed_at       timestamptz
  is_featured     boolean
  is_visible      boolean
  display_order   integer
  synced_at       timestamptz

## 6. AI Router

### `ai_router_settings`

  Column                   Type
  ------------------------ -------------
  id                       uuid PK
  is_enabled               boolean
  monthly_token_limit      bigint
  requests_per_minute      integer
  requests_per_hour        integer
  requests_per_day         integer
  quota_exceeded_message   text
  created_at               timestamptz
  updated_at               timestamptz

### `ai_providers`

  Column           Type
  ---------------- -------------
  id               uuid PK
  name             text
  base_url         text
  secret_api_key   text
  is_active        boolean
  created_at       timestamptz
  updated_at       timestamptz

`secret_api_key` harus diperlakukan sebagai secret. Jangan expose ke
browser atau public API.

Untuk production, pertimbangkan encryption-at-rest/application-level
encryption atau secret manager sesuai deployment architecture.

### `ai_models`

  Column         Type
  -------------- ------------------
  id             uuid PK
  provider_id    uuid FK
  model_name     text
  display_name   text
  input_price    numeric nullable
  output_price   numeric nullable
  is_active      boolean
  created_at     timestamptz
  updated_at     timestamptz

Unique:

``` text
(provider_id, model_name)
```

### `ai_api_keys`

  Column         Type
  -------------- ----------------------
  id             uuid PK
  key_prefix     text
  key_hash       text UNIQUE
  label          text nullable
  is_active      boolean
  last_used_at   timestamptz nullable
  created_at     timestamptz
  revoked_at     timestamptz nullable

Public API key sebaiknya hanya ditampilkan saat creation/regeneration.
Simpan hash untuk validasi dan prefix untuk identifikasi.

### `ai_usage_logs`

  Column          Type
  --------------- ------------------
  id              uuid PK
  api_key_id      uuid FK nullable
  provider_id     uuid FK nullable
  model_id        uuid FK nullable
  request_id      text
  input_tokens    bigint
  output_tokens   bigint
  total_tokens    bigint
  status_code     integer
  latency_ms      integer
  error_code      text nullable
  created_at      timestamptz

Jangan menyimpan prompt/response secara default.

### `ai_rate_limits`

  Column              Type
  ------------------- -------------
  id                  uuid PK
  identifier          text
  window_type         text
  request_count       integer
  window_started_at   timestamptz
  expires_at          timestamptz

Untuk traffic kecil dapat menggunakan PostgreSQL. Jika traffic
meningkat, pindahkan rate limiting ke Redis/Upstash.

## 7. Analytics

### `analytics_visitors`

  Column          Type
  --------------- ---------------
  id              uuid PK
  visitor_hash    text UNIQUE
  first_seen_at   timestamptz
  last_seen_at    timestamptz
  country         text nullable
  region          text nullable
  device_type     text nullable
  browser         text nullable
  os              text nullable

### `analytics_sessions`

  Column             Type
  ------------------ ---------------
  id                 uuid PK
  visitor_id         uuid FK
  started_at         timestamptz
  last_activity_at   timestamptz
  landing_page       text
  exit_page          text nullable
  referrer           text nullable

### `analytics_pageviews`

  Column        Type
  ------------- ------------------
  id            uuid PK
  session_id    uuid FK
  visitor_id    uuid FK
  path          text
  title         text nullable
  viewed_at     timestamptz
  duration_ms   integer nullable

### `analytics_events`

  Column       Type
  ------------ ----------------
  id           uuid PK
  session_id   uuid FK
  visitor_id   uuid FK
  event_name   text
  path         text nullable
  metadata     jsonb nullable
  created_at   timestamptz

## 8. Website

### `site_settings`

  Column             Type
  ------------------ ---------------
  id                 uuid PK
  site_name          text
  logo_url           text nullable
  favicon_url        text nullable
  meta_title         text nullable
  meta_description   text nullable
  og_image_url       text nullable
  maintenance_mode   boolean
  updated_at         timestamptz

### `navigation_items`

  Column          Type
  --------------- ---------------
  id              uuid PK
  label           text
  path            text
  icon            text nullable
  display_order   integer
  is_visible      boolean
  is_external     boolean
  created_at      timestamptz
  updated_at      timestamptz

## 9. Index Recommendations

Buat index minimal pada:

``` text
experiences(display_order, is_visible)
achievements(display_order, is_visible)
educations(display_order, is_visible)
socials(display_order, is_visible)
blog_posts(slug)
blog_posts(status, published_at)
github_repositories(pushed_at)
github_repositories(is_featured, is_visible)
ai_models(provider_id, is_active)
ai_usage_logs(created_at)
ai_usage_logs(model_id, created_at)
analytics_pageviews(viewed_at)
analytics_pageviews(path, viewed_at)
analytics_sessions(started_at)
analytics_events(event_name, created_at)
```

## 10. RLS Strategy

### Public

Public boleh membaca hanya data yang memang public:

-   visible profile,
-   visible experience,
-   visible achievement,
-   visible education,
-   visible social,
-   active document,
-   published blog,
-   visible project,
-   active public router configuration yang memang aman dipublikasikan.

### Owner

Owner dapat full CRUD terhadap seluruh CMS resource.

### AI Secret

Provider secret tidak boleh di-query langsung dari browser.

Operasi provider harus melalui Nuxt server API.

### Analytics

Visitor tidak boleh membaca analytics database.

Owner dapat membaca analytics melalui protected server route atau policy
khusus.

## 11. Storage Buckets

Recommended:

``` text
avatars
documents
blog-images
achievement-images
site-assets
```

Public/private disesuaikan dengan kebutuhan:

-   avatar/site assets: public
-   published blog images: public
-   CV: public jika memang ingin diunduh
-   admin/private documents: private

## 12. Owner Bootstrap

Tidak ada public registration.

Flow:

1.  Create user melalui Supabase Auth.
2.  Ambil user UUID.
3.  Insert `user_profiles`.
4.  Set role `OWNER`.
5.  Login melalui `/admin/login`.

Password tidak disimpan di tabel aplikasi.
