/**
 * Maintenance mode hides the public site without touching the admin or the
 * public router, which are independent toggles.
 *
 * `useSiteSettings` caches under `site-settings`, so this costs one query per
 * session rather than one per navigation.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/admin') || to.path.startsWith('/api')) return
  // The holding page itself must not recurse through this guard.
  if (to.path === '/maintenance') return

  // The shared loader, not a private `useAsyncData`: a second registration
  // under the same key would race the one the layout and app shell rely on.
  const { data } = await useSiteSettings()

  if (!data.value?.maintenance_mode) return

  return navigateTo('/maintenance', { redirectCode: 302 })
})
