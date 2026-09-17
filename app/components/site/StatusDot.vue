<script setup lang="ts">
import { Motion } from 'motion-v'

withDefaults(defineProps<{ label?: string; tone?: 'primary' | 'muted' }>(), {
  label: '',
  tone: 'primary',
})
</script>

<template>
  <span class="inline-flex items-center gap-2">
    <Motion
      as="span"
      class="size-1.5 shrink-0 rounded-full"
      :class="tone === 'primary' ? 'bg-primary' : 'bg-muted-foreground'"
      :animate="{ opacity: [1, 0.4, 1] }"
      :transition="{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }"
    />
    <span v-if="label" class="text-caption text-muted-foreground">{{ label }}</span>
  </span>
</template>
