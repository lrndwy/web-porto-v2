# Dashboard Design --- Owner Dashboard

## 1. Design Direction

Dashboard menggunakan prinsip:

-   general
-   elegant
-   unique
-   clean
-   lightweight
-   responsive
-   information-dense tetapi tidak penuh
-   minimal visual noise

Visual identity tidak dibuat seperti template admin generik. Dashboard
harus terasa seperti **private control center milik seorang developer**.

## 2. Design Principles

### 2.1 Calm Interface

Gunakan:

-   neutral background,
-   white/dark surfaces,
-   subtle borders,
-   soft radius,
-   minimal shadow,
-   typography hierarchy yang jelas.

### 2.2 One Accent

Gunakan satu accent color utama untuk:

-   primary button,
-   active navigation,
-   links,
-   status highlight,
-   chart emphasis.

Jangan menggunakan banyak warna dekoratif.

### 2.3 Lightweight

Hindari:

-   background animation berat,
-   excessive blur,
-   3D objects,
-   video background,
-   excessive gradients,
-   oversized illustrations.

## 3. Layout

Desktop:

``` text
┌──────────────────────────────────────────────────────┐
│ Sidebar │ Topbar                                    │
│         ├────────────────────────────────────────────┤
│         │                                            │
│         │              Page Content                  │
│         │                                            │
│         │                                            │
└─────────┴────────────────────────────────────────────┘
```

Sidebar:

-   fixed/sticky,
-   width sekitar 240--260px,
-   collapsible pada desktop,
-   drawer pada mobile.

Content:

-   max-width sekitar 1440px,
-   generous spacing,
-   responsive grid.

## 4. Sidebar

``` text
Portfolio Admin

Overview

ANALYTICS
Analytics

PORTFOLIO
Profile
Experience
Achievement
Education
Social Media
Documents

CONTENT
Projects
Blog

AI ROUTER
Overview
Providers
Models
API Key
Usage
Logs

WEBSITE
General
Navigation
SEO
Maintenance

SETTINGS
Account
Security
```

Active menu menggunakan accent + subtle background.

## 5. Topbar

Topbar berisi:

-   page title,
-   breadcrumb optional,
-   search/command menu,
-   website preview,
-   notifications optional,
-   Owner avatar/menu.

Command shortcut:

`⌘K` / `Ctrl+K`

Search actions:

-   Edit Profile
-   Create Blog
-   Manage Providers
-   View Analytics
-   Open Public Website

## 6. Dashboard Overview

### KPI Cards

Empat sampai delapan card:

``` text
Visitors
2,481
+18.2%

Page Views
5,732
+12.4%

AI Requests
1,284
+21%

AI Tokens
82,421
82.4% used
```

Tambahkan:

-   blog posts,
-   projects,
-   sessions,
-   router status.

## 7. Analytics Visualization

### Visitor Trend

Line chart:

-   selected period,
-   daily/weekly granularity,
-   tooltip,
-   compact axis.

### Top Pages

Table:

``` text
Path
Views
Visitors
```

### Traffic Sources

Table/bar:

``` text
Source
Visitors
Percentage
```

### Devices

Compact cards:

-   Desktop
-   Mobile
-   Tablet

## 8. AI Router Dashboard

Header:

``` text
AI Router
● Operational

https://domain.com/api/router
```

KPI:

-   Requests
-   Tokens used
-   Remaining tokens
-   Active providers
-   Active models

Quota card:

``` text
82,421 / 100,000 tokens

████████████████░░░░

17,579 remaining
```

## 9. Provider Page

Card per provider:

``` text
OpenAI
https://api.openai.com/v1

3 active models
● Connected

[Manage]
```

Provider form:

-   provider name,
-   base URL,
-   API key,
-   connection test,
-   active state.

Secret input harus masked.

## 10. Model Page

Table:

``` text
Model
Provider
Status
Pricing
Actions
```

Filter:

-   all
-   active
-   inactive
-   provider

## 11. API Key Page

Public key card:

``` text
Public API Key

pk_uhuy_xxxxxxxxxxxxx

Created
17 Sep 2026

Last Used
2 min ago

[Copy]
[Regenerate]
[Revoke]
```

Regenerate harus membutuhkan confirmation.

## 12. Usage Page

Metrics:

-   requests today,
-   requests this month,
-   total tokens,
-   input tokens,
-   output tokens,
-   average latency,
-   error rate.

Filters:

-   date,
-   provider,
-   model,
-   status.

## 13. Logs Page

Dense table dengan pagination:

``` text
Time
Request ID
Provider
Model
Tokens
Status
Latency
```

Klik row membuka detail.

Prompt/response tidak ditampilkan karena tidak disimpan secara default.

## 14. Portfolio CRUD Design

Gunakan pattern:

``` text
Page Header
[Search] [Filter] [+ Add]

Content Table/List

Pagination
```

Edit menggunakan:

-   dedicated page untuk form kompleks,
-   modal/sheet untuk form pendek.

## 15. Blog Editor

Editor harus memiliki area luas.

``` text
┌──────────────────────────────────────────┐
│ Title                                    │
├──────────────────────────────────────────┤
│ Toolbar                                  │
├──────────────────────────────────────────┤
│                                          │
│ WYSIWYG Content                          │
│                                          │
└──────────────────────────────────────────┘

Sidebar:
Category
Tags
Thumbnail
SEO
Status

[Save Draft] [Publish]
```

## 16. Empty States

Jangan hanya menampilkan blank page.

Contoh:

``` text
No articles yet.

Create your first article to start
building your developer blog.

[Create Article]
```

## 17. Feedback States

Wajib memiliki:

-   loading skeleton,
-   success toast,
-   error toast,
-   confirmation dialog,
-   inline validation,
-   empty state,
-   disabled state.

## 18. Responsive

Mobile:

``` text
Topbar
Content
Bottom/Drawer Navigation
```

Table menjadi:

-   card list,
-   horizontal scroll hanya jika benar-benar diperlukan.

Form:

-   single column,
-   sticky action bar optional.

## 19. Typography

Gunakan satu font family utama.

Hierarchy:

-   Display: 32--40px
-   H1: 28--32px
-   H2: 22--24px
-   H3: 18--20px
-   Body: 14--16px
-   Caption: 12--13px

Jangan menggunakan terlalu banyak font weight.

## 20. Components

Core:

-   Button
-   Input
-   Textarea
-   Select
-   Combobox
-   Checkbox
-   Switch
-   Tabs
-   Dialog
-   Sheet
-   Dropdown
-   Tooltip
-   Toast
-   Table
-   Card
-   Badge
-   Progress
-   Skeleton
-   Breadcrumb
-   Command

## 21. Visual Personality

Keunikan berasal dari:

-   typography,
-   spacing,
-   micro-interactions,
-   subtle status indicators,
-   developer-oriented data presentation,
-   clean code-inspired details.

Bukan dari efek visual berat.

## 22. Dark Mode

Support dark mode.

Dark mode tetap menggunakan:

-   neutral surfaces,
-   subtle borders,
-   restrained accent,
-   readable contrast.

Tidak menggunakan pure black sebagai default surface untuk seluruh UI.

## 23. Performance Rules

-   gunakan CSS transitions sederhana,
-   hindari animation library jika CSS cukup,
-   gunakan virtualized/list pagination untuk data besar,
-   lazy-load editor,
-   lazy-load analytics chart,
-   optimize images,
-   jangan render seluruh dashboard data sekaligus.
