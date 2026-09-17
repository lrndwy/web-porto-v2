<script setup lang="ts">
definePageMeta({ layout: 'admin', title: 'Edit article' })

const route = useRoute()
</script>

<template>
  <BlogEditorShell :id="String(route.params.id)" />
</template>
