<script setup lang="ts">
useSeo({ title: 'Temporarily unavailable' })
</script>

<template>
  <div class="bg-background text-foreground flex min-h-[100dvh] items-center justify-center px-4">
    <Empty class="max-w-md">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon name="ph:warning" />
        </EmptyMedia>
        <EmptyTitle class="text-title">Back shortly</EmptyTitle>
        <EmptyDescription class="text-body">
          The site is being updated. The portfolio content will be available again shortly.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  </div>
</template>
