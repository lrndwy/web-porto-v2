# Web Portfolio Design --- Public Website

## 1. Design Direction

Public portfolio memiliki karakter:

**General + Elegant + Unique + Clean + Lightweight**

Website harus terlihat profesional tanpa menjadi template portfolio
developer yang terlalu umum.

Kesan yang dituju:

-   mature,
-   technical,
-   personal,
-   minimal,
-   confident,
-   modern.

## 2. Core Principle

Konten menjadi fokus utama.

Jangan menggunakan:

-   hero terlalu tinggi,
-   animation berlebihan,
-   particle background,
-   3D canvas,
-   video background,
-   excessive gradients,
-   terlalu banyak card.

Visual identity dibangun dari typography, whitespace, grid, image
treatment, dan detail kecil.

## 3. Main Navigation

Desktop:

``` text
[Logo / Name]

About
Experience
Projects
Blog
AI Router
Contact

[CV]
```

Navigation sticky tetapi compact.

Mobile:

``` text
Logo                     Menu
```

Drawer navigation.

## 4. Homepage

Struktur:

``` text
Hero
↓
Selected Projects
↓
Experience
↓
About
↓
Latest Articles
↓
AI Router
↓
Contact
↓
Footer
```

Tidak semua section harus ditampilkan sekaligus jika Owner mematikannya
dari Dashboard.

## 5. Hero

Hero harus ringkas.

Contoh struktur:

``` text
Hi, I'm Hafiz.

Software Engineer & Founder

I build software, digital products,
and systems that solve real problems.

[View Projects] [Read About Me]

GitHub  LinkedIn  Instagram ...
```

Tambahkan status kecil:

``` text
● Available for selected opportunities
```

Jika status tersebut ingin dikelola, jadikan content CMS.

## 6. Hero Visual

Gunakan salah satu:

-   portrait/avatar,
-   abstract geometric shape,
-   minimal developer visual,
-   project screenshot.

Jangan gunakan visual besar yang mengganggu content.

## 7. About

Layout dua kolom desktop:

``` text
About Me
────────────────────────
Text content

Quick Facts
Location
Focus
Experience
Education
```

Mobile menjadi single column.

## 8. Experience

Timeline minimal:

``` text
2026 — Present
Organization
Role

Description
```

Gunakan vertical line tipis atau marker kecil.

Tidak perlu timeline dengan banyak dekorasi.

## 9. Achievements

Gunakan compact grid:

``` text
Achievement
Issuer
Date
Certificate →
```

Image hanya digunakan jika membantu.

## 10. Education

Simple timeline/card:

``` text
Institution
Degree / Program
2024 — 2028
```

Logo optional.

## 11. Projects

Project menjadi salah satu section utama.

Card:

``` text
Project Name

Short description

Next.js · Go · PostgreSQL

GitHub →
Live Demo →
```

Jika repository berasal dari GitHub, tampilkan:

-   language,
-   stars,
-   forks,
-   updated date.

### Latest Projects

Sistem mengambil repository terbaru berdasarkan `pushed_at`.

Owner tetap dapat memilih featured projects.

## 12. Featured Project

Satu project unggulan boleh menggunakan layout lebih besar:

``` text
┌──────────────────────────────────────────────┐
│ Project Screenshot                           │
│                                              │
│ Project Name                                 │
│ Description                                  │
│                                              │
│ Stack                                        │
│ [GitHub] [Live Demo]                         │
└──────────────────────────────────────────────┘
```

## 13. Blog

Blog list:

``` text
Latest Articles

[Image]
Title
Excerpt
Category · 5 min read
Published date
```

Grid 2--3 columns desktop.

Mobile single column.

## 14. Blog Detail

Layout:

``` text
Category
Title
Excerpt
Published date

Hero Image

Article Content

Related Articles
```

Article content harus sangat readable.

Recommended content width:

`680–760px`

Code block:

-   monospace,
-   horizontal scroll,
-   syntax highlighting,
-   copy button optional.

## 15. AI Router Page

AI Router menjadi fitur showcase khusus.

Header:

``` text
AI Router

One endpoint.
Multiple AI providers.

● Operational
```

Endpoint:

``` text
https://domain.com/v1
```

Public API key:

``` text
pk_uhuy_xxxxxxxxx

[Copy]
```

### Usage

``` text
82,421 / 100,000 tokens

17,579 tokens remaining
```

### Available Models

``` text
GPT-X
OpenAI
● Available

Gemini-X
Gemini
● Available

Gemini-Y
Gemini
● Available
```

### API Example

``` bash
curl https://domain.com/v1/chat/completions \
  -H "Authorization: Bearer pk_uhuy_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "model-name",
    "messages": [
      {
        "role": "user",
        "content": "Hello"
      }
    ]
  }'
```

API documentation harus menjelaskan bahwa public key memang sengaja
dapat digunakan oleh publik, sedangkan provider secret tidak pernah
dipublikasikan.

## 16. Contact

Contact section sederhana:

``` text
Let's build something.

Have a project, idea, or opportunity?

Email
Social Links

[Send Message]
```

Jika contact form digunakan, validasi dan anti-spam wajib diterapkan.

## 17. CV

CV dapat muncul sebagai:

``` text
Download CV
```

atau:

``` text
View CV
Download PDF
```

File dikelola melalui Dashboard.

## 18. Footer

Footer minimal:

``` text
Hafiz Agha Al-Baith

Software Engineer & Founder

GitHub · LinkedIn · ...

© 2026 Hafiz.
Built with Nuxt.
```

Tambahkan link:

-   Privacy
-   Contact
-   AI Router

jika diperlukan.

## 19. Navigation Behavior

Navigation item berasal dari database.

Owner dapat:

-   show/hide,
-   reorder,
-   rename label,
-   set external URL.

Jika Router disabled:

-   menu Router hilang,
-   public `/router` tidak menampilkan service aktif,
-   API Router dapat dinonaktifkan secara terpisah.

## 20. Responsive Design

### Mobile

Prioritas:

1.  readability,
2.  navigation,
3.  CTA,
4.  project cards,
5.  blog.

Hero jangan terlalu tinggi.

### Tablet

Gunakan 2-column grid jika cukup ruang.

### Desktop

Gunakan max-width sekitar 1200--1400px.

Content text tetap memiliki max-width agar mudah dibaca.

## 21. Color System

Gunakan neutral-first system:

-   background,
-   foreground,
-   muted,
-   border,
-   surface,
-   accent.

Accent hanya untuk:

-   CTA,
-   links,
-   active states,
-   important status.

Jangan menggunakan banyak gradient.

## 22. Typography

Typography menjadi elemen visual utama.

Recommended:

-   modern sans-serif untuk UI,
-   optional monospace untuk code/technical metadata.

Body:

`16px` sekitar untuk desktop.

Line-height nyaman.

Heading menggunakan weight kuat tetapi tidak berlebihan.

## 23. Micro Interactions

Gunakan interaksi ringan:

-   link underline transition,
-   button hover,
-   card border transition,
-   image scale kecil,
-   navigation active transition,
-   copy-to-clipboard feedback.

Durasi sekitar `150–250ms`.

Hindari scroll-jacking.

## 24. Accessibility

-   semantic HTML,
-   keyboard navigation,
-   visible focus,
-   alt text,
-   proper heading order,
-   accessible buttons,
-   sufficient contrast,
-   reduced motion support.

## 25. SEO

Setiap page memiliki:

-   title,
-   description,
-   canonical,
-   Open Graph,
-   Twitter/X metadata,
-   structured data bila relevan.

Blog memiliki metadata individual.

## 26. Performance

Target design:

-   minimal JavaScript,
-   SSR/SSG sesuai kebutuhan,
-   optimized image,
-   lazy image,
-   font optimization,
-   minimal animation,
-   cache GitHub API,
-   avoid giant component bundles.

Public portfolio harus tetap cepat walaupun memiliki CMS dan AI Router.

## 27. Overall Visual Composition

``` text
┌──────────────────────────────────────────────┐
│ NAVIGATION                                    │
├──────────────────────────────────────────────┤
│                                              │
│ HERO                                         │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│ SELECTED PROJECTS                            │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│ EXPERIENCE                                   │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│ ABOUT                                        │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│ LATEST ARTICLES                              │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│ AI ROUTER                                    │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│ CONTACT                                      │
│                                              │
├──────────────────────────────────────────────┤
│ FOOTER                                       │
└──────────────────────────────────────────────┘
```

## 28. Design Rule

**Less decoration, more personality.**

Website harus terasa unik karena:

-   content,
-   typography,
-   layout,
-   project presentation,
-   AI Router,
-   GitHub integration,
-   subtle interactions.

Bukan karena banyak efek.
