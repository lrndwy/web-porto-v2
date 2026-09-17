<script setup lang="ts">
defineProps<{
  overline?: string
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <p
      v-if="overline"
      class="text-caption text-muted-foreground font-mono tracking-widest uppercase"
    >
      {{ overline }}
    </p>
    <h2 class="text-title">{{ title }}</h2>
    <p v-if="description" class="text-body text-muted-foreground measure">{{ description }}</p>
  </div>
</template>
