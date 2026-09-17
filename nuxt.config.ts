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

  app: {
    head: {
      link: [{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
      script: [
        {
          // Applies the stored theme before first paint so the toggle never
          // flashes the wrong surface. Kept inline and dependency-free.
          innerHTML:
            "(function(){try{if(localStorage.getItem('wp-theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})()",
          tagPriority: 'critical',
        },
      ],
    },
  },

  shadcn: { prefix: '', componentDir: '@/components/ui' },

  // Components are addressed by their file name (`<AppNav>`, `<ProjectCard>`),
  // matching the plan. `ui/**` is excluded because shadcn-nuxt already
  // registers those explicitly by name.
  components: [{ path: '~/components', pathPrefix: false, ignore: ['ui/**'] }],

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
    '/api/router': { cors: true },
    '/admin/**': { ssr: false },
    // ponytail: swr is disabled while the content phases are being built so a
    // cached response cannot mask a change. Restore the plan's values
    // (/, 300; /projects 600; /blog 600; /blog/** 600) in Phase 12.
    // '/': { swr: 300 },
    // '/projects': { swr: 600 },
    // '/blog': { swr: 600 },
    // '/blog/**': { swr: 600 },
  },

  nitro: { compressPublicAssets: true },

  sitemap: { sources: ['/api/__sitemap__/urls'] },
})
