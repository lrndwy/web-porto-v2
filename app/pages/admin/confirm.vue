<script setup lang="ts">
definePageMeta({ layout: 'auth', title: 'Signing you in' })

const user = useSupabaseUser()
const router = useRouter()
const redirect = useSupabaseCookieRedirect()

// The client plugin exchanges the PKCE code on load; this page only has to wait
// for the resulting session and then forward the owner.
watchEffect(() => {
  if (user.value) {
    router.replace(redirect.pluck() || '/admin/dashboard')
  }
})

onMounted(() => {
  // Give the exchange a moment; if it never lands the owner can sign in again.
  setTimeout(() => {
    if (!user.value) router.replace('/admin/login')
  }, 5000)
})
</script>

<template>
  <div class="flex items-center gap-3">
    <Skeleton class="size-4 rounded-full" />
    <p class="text-body text-muted-foreground">Confirming your sign-in…</p>
  </div>
</template>
