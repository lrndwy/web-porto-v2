<script setup lang="ts">
defineProps<{
  title: string
  body: string
  phase: string
}>()
</script>

<template>
  <div class="mx-auto max-w-md py-16">
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon name="ph:hourglass-medium" />
        </EmptyMedia>
        <EmptyTitle>{{ title }}</EmptyTitle>
        <EmptyDescription>{{ body }}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Badge variant="outline" class="font-mono">{{ phase }}</Badge>
      </EmptyContent>
    </Empty>
  </div>
</template>
