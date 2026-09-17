<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <section :id="id" class="py-20 md:py-28">
    <div class="mx-auto w-full max-w-[1400px] px-6">
      <slot />
    </div>
  </section>
</template>
