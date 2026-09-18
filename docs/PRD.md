# PRD --- Personal Developer Portfolio Platform

## 1. Overview

Personal Developer Portfolio Platform adalah website personal yang
berfungsi sebagai portfolio, content management system, GitHub project
showcase, blog, public AI Router/Gateway, dan website analytics.

Platform memiliki dua area utama:

-   **Public Website** --- dapat diakses oleh siapa saja.
-   **Owner Dashboard** --- area privat untuk mengelola seluruh konten,
    konfigurasi website, AI Router, dan analytics.

Deployment menggunakan **Vercel**, aplikasi dibangun dengan **Nuxt JS**,
database dan authentication menggunakan **Supabase**, serta UI
menggunakan **shadcn-vue + Tailwind CSS**.

## 2. Product Vision

Membangun personal portfolio yang bukan hanya menampilkan identitas dan
karya, tetapi juga menunjukkan kemampuan engineering melalui sistem CMS,
integrasi GitHub, AI Router multi-provider, dan analytics yang
terintegrasi.

## 3. Goals

### Primary Goals

1.  Seluruh konten portfolio dapat dikelola dari Owner Dashboard.
2.  Public website cepat, responsive, clean, dan ringan.
3.  Project terbaru dapat disinkronkan dari GitHub.
4.  Blog mendukung WYSIWYG editor.
5.  AI Router dapat menggabungkan beberapa AI provider dan model melalui
    satu endpoint.
6.  Public API menggunakan satu generated API key.
7.  Owner dapat mengatur token quota dan rate limit.
8.  Owner dapat melihat statistik pengunjung dan penggunaan AI.
9.  Authentication dan authorization aman.
10. Website mudah dikembangkan tanpa mengubah arsitektur utama.

## 4. Non-Goals

Untuk MVP, sistem tidak bertujuan menjadi:

-   SaaS CMS multi-tenant.
-   Marketplace AI.
-   Platform social media.
-   Full-featured analytics replacement.
-   AI provider billing platform.
-   Multi-owner collaboration platform.

## 5. Target Users

### Public Visitor

Pengunjung yang ingin:

-   mengenal Owner,
-   melihat pengalaman dan pendidikan,
-   melihat project,
-   membaca blog,
-   mengunduh CV,
-   mengakses social media,
-   mencoba AI Router secara gratis.

### Owner

Pemilik portfolio yang ingin:

-   mengelola seluruh konten,
-   mengatur website,
-   mengelola GitHub integration,
-   mengelola AI provider/model,
-   mengatur quota,
-   memantau penggunaan,
-   memantau visitor analytics.

## 6. Information Architecture

### Public

-   `/`
-   `/about`
-   `/experience`
-   `/achievement`
-   `/education`
-   `/projects`
-   `/blog`
-   `/blog/[slug]`
-   `/router`
-   `/contact`
-   `/cv`

### Admin

-   `/admin/login`
-   `/admin/dashboard`
-   `/admin/analytics`
-   `/admin/profile`
-   `/admin/experience`
-   `/admin/achievement`
-   `/admin/education`
-   `/admin/social`
-   `/admin/documents`
-   `/admin/projects`
-   `/admin/blog`
-   `/admin/router`
-   `/admin/router/providers`
-   `/admin/router/models`
-   `/admin/router/api-key`
-   `/admin/router/usage`
-   `/admin/router/logs`
-   `/admin/website`
-   `/admin/settings`

## 7. Core Modules

### 7.1 Profile CMS

Data:

-   name
-   title
-   short description
-   long description
-   avatar
-   location
-   email
-   phone
-   GitHub username
-   website

### 7.2 Experience

CRUD pengalaman dengan:

-   title
-   organization
-   description
-   location
-   start date
-   end date
-   current status
-   logo
-   display order
-   visibility

### 7.3 Achievement

CRUD prestasi dengan:

-   title
-   issuer
-   description
-   date
-   certificate URL
-   image
-   order
-   visibility

### 7.4 Education

CRUD pendidikan dengan:

-   institution
-   degree
-   field
-   description
-   start date
-   end date
-   logo
-   order
-   visibility

### 7.5 Social Media

CRUD social links:

-   platform
-   username
-   URL
-   icon
-   order
-   visibility

### 7.6 Documents

Pengelolaan CV/dokumen:

-   document name
-   type
-   file
-   version
-   visibility
-   active status

Storage menggunakan Supabase Storage.

### 7.7 GitHub Projects

Owner memasukkan GitHub username.

Server mengambil repository melalui GitHub API dengan konsep:

`/users/{username}/repos?sort=pushed&direction=desc`

Fitur:

-   sync repositories
-   cache
-   featured projects
-   visibility
-   order
-   repository metadata
-   language
-   stars
-   forks
-   pushed date
-   repository URL

### 7.8 Blog

Blog memiliki:

-   title
-   slug
-   excerpt
-   thumbnail
-   content
-   category
-   tags
-   author
-   status
-   published date
-   SEO metadata

Status:

-   draft
-   published
-   archived

Editor menggunakan WYSIWYG.

### 7.9 AI Router

AI Router menjadi public gateway dengan path standar AI, bukan
`/api/router`.

Endpoint:

-   `POST /v1/chat/completions` --- OpenAI-compatible,
-   `POST /v1/messages` --- Anthropic Messages,
-   `GET /v1/models` --- daftar model OpenAI-compatible.

Client menggunakan:

-   public API key (`Authorization: Bearer` atau `x-api-key`)
-   model
-   messages/request payload

Router:

1.  validasi public API key,
2.  validasi router status,
3.  validasi rate limit,
4.  validasi quota,
5.  validasi model,
6.  resolve provider,
7.  forward request,
8.  parse usage,
9.  simpan usage log,
10. return response.

### 7.10 AI Provider

Owner dapat menambahkan:

-   provider name
-   base URL
-   format (`openai` atau `anthropic`)
-   secret API key
-   active status

Format menentukan bentuk request/response dan header auth upstream. Gateway
menerjemahkan antara format client dan format provider bila berbeda.

Provider dapat memiliki banyak model.

### 7.11 AI Model

Setiap model memiliki:

-   provider
-   model name
-   display name
-   active status
-   input token pricing (optional)
-   output token pricing (optional)

### 7.12 AI API Key

Sistem menyediakan satu public API key untuk router.

Contoh:

`pk_uhuy_xxxxxxxxx`

Provider secret key tidak pernah dikirim ke client.

Owner dapat:

-   melihat masked key,
-   copy key,
-   regenerate key,
-   disable key.

### 7.13 AI Quota

Owner dapat menentukan:

-   monthly token limit
-   requests/minute
-   requests/hour
-   requests/day
-   behavior ketika quota habis.

### 7.14 Analytics

Website analytics mengumpulkan event anonim.

Metrics:

-   visitors
-   unique visitors
-   sessions
-   page views
-   average session duration
-   traffic source
-   top pages
-   device
-   browser
-   OS
-   country/region
-   custom events

Custom events:

-   page_view
-   cv_download
-   github_click
-   social_click
-   project_view
-   blog_view
-   contact_submit
-   ai_router_request

### 7.15 Website Settings

Owner dapat mengatur:

-   site name
-   logo
-   favicon
-   SEO
-   OG image
-   navigation
-   maintenance mode
-   public router visibility

## 8. Owner Account

Tidak ada public registration.

Owner dibuat melalui Supabase Auth.

Role utama:

`OWNER`

Future roles:

-   ADMIN
-   EDITOR

Authentication:

-   email/password
-   password reset
-   session handling
-   optional MFA

Authorization menggunakan role di database dan RLS.

## 9. Functional Requirements

### FR-01 Authentication

Sistem harus memungkinkan Owner login dan logout.

### FR-02 Authorization

Sistem harus memastikan hanya user dengan role yang sesuai dapat
mengakses resource admin.

### FR-03 CMS

Owner harus dapat membuat, membaca, mengubah, menghapus, mengurutkan,
dan mengatur visibility content.

### FR-04 Blog

Owner harus dapat menulis dan menerbitkan artikel menggunakan WYSIWYG.

### FR-05 GitHub

Sistem harus dapat mengambil repository terbaru berdasarkan pushed date.

### FR-06 AI Router

Sistem harus menyediakan satu endpoint public untuk beberapa
provider/model.

### FR-07 Quota

Sistem harus menolak request ketika token quota telah tercapai.

### FR-08 Rate Limit

Sistem harus membatasi jumlah request berdasarkan periode.

### FR-09 Usage

Sistem harus mencatat usage AI.

### FR-10 Analytics

Sistem harus mencatat anonymous page views dan events.

### FR-11 Website Router

Owner dapat mengaktifkan/nonaktifkan halaman router.

### FR-12 Navigation

Owner dapat mengatur item navigation dan visibility.

## 10. Non-Functional Requirements

### Performance

-   gunakan server-side rendering sesuai kebutuhan,
-   lazy load komponen berat,
-   optimasi image,
-   caching API,
-   minimalkan JavaScript client.

### Security

-   provider secret tidak boleh exposed,
-   service role key hanya server-side,
-   RLS wajib aktif,
-   admin route wajib protected,
-   rate limit public API,
-   API key dapat direvoke/regenerate.

### Accessibility

-   keyboard accessible,
-   semantic HTML,
-   readable contrast,
-   visible focus state,
-   alt text.

### Responsive

Target:

-   mobile
-   tablet
-   desktop
-   wide desktop

## 11. Tech Stack

-   Nuxt JS
-   TypeScript
-   Supabase
-   PostgreSQL
-   Supabase Auth
-   Supabase Storage
-   shadcn-vue
-   Tailwind CSS
-   GitHub REST API
-   Vercel
-   Redis/Upstash Redis optional untuk rate limiting skala lanjut

## 12. Success Criteria

Project dianggap berhasil apabila:

-   Owner dapat mengelola seluruh konten tanpa mengubah source code.
-   Public portfolio dapat menampilkan project GitHub terbaru.
-   Blog dapat dibuat dan diterbitkan melalui dashboard.
-   AI Router dapat menerima request dan meneruskannya ke provider
    aktif.
-   Provider secret tetap aman.
-   Quota dan rate limit bekerja.
-   Visitor analytics tampil di dashboard.
-   Public website tetap ringan dan responsive.
