<script setup lang="ts">
const { data: settings } = await useSiteSettings()
const { data: profile } = await useProfile()
const { data: socials } = await useSocials()

const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t">
    <div class="mx-auto w-full max-w-[1400px] px-6 py-12">
      <div class="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div class="flex flex-col gap-1">
          <p class="text-subtitle">{{ profile?.name ?? settings?.site_name }}</p>
          <p v-if="profile?.title" class="text-caption text-muted-foreground">{{ profile.title }}</p>
        </div>

        <div class="flex flex-col gap-4 md:items-end">
          <SocialLinks v-if="socials?.length" :socials="socials" />
          <nav class="flex flex-wrap items-center gap-4" aria-label="Footer">
            <NuxtLink to="/privacy" class="text-caption text-muted-foreground hover:text-foreground transition-colors duration-200">Privacy</NuxtLink>
            <NuxtLink to="/contact" class="text-caption text-muted-foreground hover:text-foreground transition-colors duration-200">Contact</NuxtLink>
            <NuxtLink to="/router" class="text-caption text-muted-foreground hover:text-foreground transition-colors duration-200">AI Router</NuxtLink>
          </nav>
        </div>
      </div>

      <p class="text-caption text-muted-foreground mt-10 font-mono">
        © {{ year }} {{ profile?.name ?? settings?.site_name }}. Built with Nuxt.
      </p>
    </div>
  </footer>
</template>
