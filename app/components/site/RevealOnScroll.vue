<script setup lang="ts">
import { Motion } from 'motion-v'
import { useIntersectionObserver } from '@vueuse/core'
import type { ComponentPublicInstance } from 'vue'

const props = withDefaults(defineProps<{ delay?: number }>(), { delay: 0 })

type MotionElement = HTMLElement | ComponentPublicInstance | null

const root = ref<MotionElement>(null)
const shown = ref(false)

// Commits once: the reveal never replays when the element scrolls back out.
useIntersectionObserver(
  root,
  ([entry]) => {
    if (entry?.isIntersecting) shown.value = true
  },
  { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
)
</script>

<template>
  <Motion
    ref="root"
    as="div"
    :initial="{ opacity: 0, y: 12 }"
    :animate="shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }"
    :transition="{ type: 'spring', stiffness: 100, damping: 20, delay: props.delay }"
  >
    <slot />
  </Motion>
</template>
