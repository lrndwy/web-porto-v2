<script setup lang="ts">
import { PERIODS } from '#shared/utils/period'
import { formatNumber } from '#shared/utils/format'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', title: 'Analytics' })

const range = ref<PeriodRange>('7d')
const query = computed(() => ({ range: range.value }))

const { data: geo } = await useFetch<{ country: string; visitors: number }[]>(
  '/api/admin/analytics/geo',
  { query },
)
const { data: events } = await useFetch<{ event_name: string; count: number }[]>(
  '/api/admin/analytics/events',
  { query },
)
const { data: topPages } = await useFetch<{ path: string; views: number; visitors: number }[]>(
  '/api/admin/analytics/top-pages',
  { query: { ...query.value, limit: 50 } },
)

function exportCsv() {
  const rows = [['path', 'views', 'visitors'], ...(topPages.value ?? []).map((row) => [row.path, String(row.views), String(row.visitors)])]
  const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n')

  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `top-pages-${range.value}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast.success('Export started.')
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-title">Analytics</h2>
        <p class="text-caption text-muted-foreground">Everything the overview shows, plus geography and events.</p>
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
        <Button variant="outline" size="sm" @click="exportCsv">
          <Icon name="ph:download-simple" />
          Export CSV
        </Button>
      </div>
    </header>

    <AnalyticsPanels :range="range" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="bg-card shadow-surface flex flex-col gap-4 rounded-lg border p-5">
        <h3 class="text-subtitle">Countries</h3>
        <ul v-if="geo?.length" class="divide-border divide-y">
          <li v-for="row in geo" :key="row.country" class="flex items-center justify-between gap-4 py-2">
            <span class="text-caption">{{ row.country }}</span>
            <span class="text-caption font-mono">{{ formatNumber(row.visitors) }}</span>
          </li>
        </ul>
        <p v-else class="text-caption text-muted-foreground">No geography recorded yet.</p>
      </section>

      <section class="bg-card shadow-surface flex flex-col gap-4 rounded-lg border p-5">
        <h3 class="text-subtitle">Events</h3>
        <ul v-if="events?.length" class="divide-border divide-y">
          <li v-for="row in events" :key="row.event_name" class="flex items-center justify-between gap-4 py-2">
            <span class="text-caption font-mono">{{ row.event_name }}</span>
            <span class="text-caption font-mono">{{ formatNumber(row.count) }}</span>
          </li>
        </ul>
        <p v-else class="text-caption text-muted-foreground">No custom events in this period.</p>
      </section>
    </div>
  </div>
</template>
