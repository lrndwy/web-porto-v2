<script setup lang="ts">
import { PERIODS } from '#shared/utils/period'
definePageMeta({ layout: 'admin', title: 'Overview' })

const range = ref<PeriodRange>('7d')
</script>

<template>
  <div class="flex flex-col gap-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-title">Overview</h2>
        <p class="text-caption text-muted-foreground">Traffic, content, and router activity at a glance.</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <Button
          v-for="period in PERIODS"
          :key="period.value"
          size="sm"
          :variant="range === period.value ? 'default' : 'outline'"
          :aria-pressed="range === period.value"
          @click="range = period.value"
        >
          {{ period.label }}
        </Button>
      </div>
    </header>

    <AnalyticsPanels :range="range" />
  </div>
</template>
