<script setup lang="ts">
import { MotionConfig } from 'motion-v'

// Favicon, touch icon, and the default social image come from site_settings, so
// the Owner can change them without a deploy. The title template is set per
// page by `useSeo`, which already composes the site name.
const { data: settings } = await useSiteSettings()
const siteName = computed(() => settings.value?.site_name ?? '')

useHead({
  titleTemplate: (pageTitle) => (pageTitle ? String(pageTitle) : siteName.value),
  link: computed(() => [
    { rel: 'icon', href: settings.value?.favicon_url || '/favicon.svg' },
  ]),
})
</script>

<template>
  <MotionConfig reduced-motion="user">
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="var(--primary)" :height="2" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster position="bottom-right" />
  </MotionConfig>
</template>
