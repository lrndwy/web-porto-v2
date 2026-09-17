/**
 * Enforces the OWNER role on every `/admin/**` page.
 *
 * The plan asked for this on `app/layouts/admin.vue`, but `definePageMeta` is a
 * page-only macro and is ignored in layouts. A global middleware restricted to
 * the admin prefix gives the property the plan actually wanted — no page can
 * forget to opt in — and the public auth pages are listed explicitly below.
 *
 * The module's own global `auth-redirect` middleware already sends anonymous
 * visitors to the login page; this one answers "signed in, but not the owner".
 */
const PUBLIC_ADMIN_ROUTES = new Set([
  '/admin/login',
  '/admin/confirm',
  '/admin/forgot-password',
  '/admin/reset-password',
])

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) return
  if (PUBLIC_ADMIN_ROUTES.has(to.path)) return

  const owner = useOwner()
  if (owner.value) return

  try {
    owner.value = await $fetch<OwnerIdentity>('/api/me')
  } catch (error) {
    if (errorStatusCode(error) === 403) {
      throw createError({ statusCode: 403, fatal: true })
    }
    return navigateTo('/admin/login')
  }
})
