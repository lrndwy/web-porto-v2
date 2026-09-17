<script setup lang="ts">
import { Motion, useMotionValue, useReducedMotion, useSpring } from 'motion-v'

const props = defineProps<{ to: string; label: string }>()

/** Movement is capped so the button leans towards the pointer, never follows it. */
const CAP_PX = 6

const reduced = useReducedMotion()
const coarsePointer = ref(false)
onMounted(() => {
  coarsePointer.value = window.matchMedia('(pointer: coarse)').matches
})

const active = computed(() => !reduced.value && !coarsePointer.value)

const x = useMotionValue(0)
const y = useMotionValue(0)
const springX = useSpring(x, { stiffness: 100, damping: 20 })
const springY = useSpring(y, { stiffness: 100, damping: 20 })

const clamp = (value: number) => Math.max(-CAP_PX, Math.min(CAP_PX, value))

function onMove(event: MouseEvent) {
  if (!active.value) return
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  x.set(clamp(((event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * CAP_PX))
  y.set(clamp(((event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * CAP_PX))
}

function reset() {
  x.set(0)
  y.set(0)
}
</script>

<template>
  <Motion
    as="span"
    class="inline-block"
    :style="{ x: springX, y: springY }"
    @mousemove="onMove"
    @mouseleave="reset"
  >
    <Button as-child class="active:translate-y-px">
      <NuxtLink :to="props.to">{{ props.label }}</NuxtLink>
    </Button>
  </Motion>
</template>
