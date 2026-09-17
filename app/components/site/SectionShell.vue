<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <section :id="id" class="py-20 md:py-28">
    <div class="page-shell">
      <slot />
    </div>
  </section>
</template>
