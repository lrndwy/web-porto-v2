<script setup lang="ts">
const route = useRoute()
const title = computed(() => (route.meta.title as string | undefined) ?? 'Sign in')
</script>

<template>
  <div class="bg-background text-foreground flex min-h-[100dvh] items-center justify-center px-4 py-16">
    <div class="w-full max-w-sm">
      <NuxtLink
        to="/"
        class="text-caption text-muted-foreground hover:text-foreground font-mono transition-colors duration-200"
      >
        ← Back to site
      </NuxtLink>

      <h1 class="text-title mt-6">{{ title }}</h1>

      <div class="mt-8">
        <slot />
      </div>
    </div>
  </div>
</template>
