<script setup lang="ts">
/**
 * A single fixed layer behind the whole public site: a hairline grid that fades
 * out down the page, plus one very low-opacity accent wash at the top.
 *
 * It is `fixed` (so scrolling never repaints it), `pointer-events-none`, and
 * `aria-hidden`, which is the only place a texture is allowed to live — never on
 * a scrolling container.
 */
const gridStyle = {
  backgroundImage:
    'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
  backgroundSize: '72px 72px',
  maskImage: 'radial-gradient(ellipse 90% 55% at 50% 0%, #000 25%, transparent 78%)',
  WebkitMaskImage: 'radial-gradient(ellipse 90% 55% at 50% 0%, #000 25%, transparent 78%)',
}

const washStyle = {
  background:
    'radial-gradient(closest-side, var(--primary), transparent 70%)',
}
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
    <div class="absolute inset-0 opacity-40" :style="gridStyle" />
    <div
      class="absolute -top-64 left-1/2 h-[42rem] w-[86rem] max-w-[160vw] -translate-x-1/2 opacity-[0.06]"
      :style="washStyle"
    />
  </div>
</template>
