import tailwindcss from '@tailwindcss/vite'

const isProduction = process.env.NODE_ENV === 'production'

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

  app: {
    head: {
      // The favicon comes from site_settings at runtime (app.vue); only the
      // pre-hydration theme script is static.
      script: [
        {
          // Applies the stored theme before first paint so the toggle never
          // flashes the wrong surface. Kept inline and dependency-free.
          innerHTML:
            "(function(){try{if(localStorage.getItem('wp-theme')!=='light'){document.documentElement.classList.add('dark')}}catch(e){}})()",
          tagPriority: 'critical',
        },
      ],
    },
  },

  // Components are addressed by their file name (`<AppNav>`, `<ProjectCard>`),
  // matching the plan. `ui/**` is excluded because shadcn-nuxt already
  // registers those explicitly by name.
  components: [{ path: '~/components', pathPrefix: false, ignore: ['ui/**'] }],

  shadcn: { prefix: '', componentDir: '@/components/ui' },

  fonts: {
    families: [
      { name: 'Geist', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Geist Mono', provider: 'google', weights: [400, 500] },
    ],
  },

  icon: { mode: 'svg', serverBundle: { collections: ['ph'] } },

  supabase: {
    // Single source of truth, importable from app/, server/, and shared/.
    types: '~~/shared/types/database.types.ts',
    redirect: true,
    redirectOptions: {
      login: '/admin/login',
      callback: '/admin/confirm',
      include: ['/admin(/*)?'],
      exclude: [
        '/admin/login',
        '/admin/confirm',
        '/admin/forgot-password',
        '/admin/reset-password',
      ],
      saveRedirectToCookie: true,
    },
  },

  runtimeConfig: {
    // The Supabase module owns `runtimeConfig.supabase`; its secret comes from
    // NUXT_SUPABASE_SECRET_KEY directly, so it is not declared here.
    analyticsSalt: '', // NUXT_ANALYTICS_SALT
    githubToken: '', // NUXT_GITHUB_TOKEN  (optional)
    cronSecret: '', // NUXT_CRON_SECRET
    public: { siteUrl: '' }, // NUXT_PUBLIC_SITE_URL
  },

  routeRules: {
    '/v1/**': { cors: true },
    '/admin/**': { ssr: false, headers: { 'x-frame-options': 'DENY' } },

    // Caching is a production concern only. In development a cached SSR
    // response hides every edit until the window expires, which looks exactly
    // like a broken build.
    ...(isProduction
      ? {
        '/': { swr: 300 },
        '/projects': { swr: 600 },
        '/blog': { swr: 600 },
        '/blog/**': { swr: 600 },
      }
      : {}),

    // Baseline response headers for everything else.
    '/**': {
      headers: {
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'strict-origin-when-cross-origin',
      },
    },
  },

  nitro: { compressPublicAssets: true },

  sitemap: { sources: ['/api/__sitemap__/urls'] },

  robots: { disallow: ['/admin', '/api', '/v1'] },
})
