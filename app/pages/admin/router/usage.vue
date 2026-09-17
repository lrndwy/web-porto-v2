<script setup lang="ts">
import { PERIODS } from '#shared/utils/period'
import { formatDate, formatNumber, formatPercent } from '#shared/utils/format'

definePageMeta({ layout: 'admin', title: 'Usage' })

const range = ref<PeriodRange>('30d')
const query = computed(() => ({ range: range.value }))

const RouterUsageChart = defineAsyncComponent(() => import('~/components/charts/RouterUsageChart.vue'))

interface Usage {
  requestsToday: number
  requestsThisMonth: number
  requests: number
  inputTokens: number
  outputTokens: number
  totalTokens: number
  averageLatency: number
  errorRate: number
  topModels: { model_id: string; count: number }[]
}

const { data: usage } = await useFetch<Usage>('/api/admin/router/usage', { query })
const { data: logs } = await useFetch<{ items: AiUsageLogRow[] }>('/api/admin/router/logs', {
  query: { ...query.value, pageSize: 200 },
})
const { data: models } = await useFetch<{ id: string; display_name: string }[]>('/api/admin/router/models')

const modelNames = computed(
  () => new Map((models.value ?? []).map((model) => [model.id, model.display_name])),
)

const tokensByDay = computed(() => {
  const buckets = new Map<string, number>()
  for (const row of logs.value?.items ?? []) {
    const day = String(row.created_at).slice(0, 10)
    buckets.set(day, (buckets.get(day) ?? 0) + Number(row.total_tokens ?? 0))
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, tokens]) => ({ date, tokens }))
})

const metrics = computed(() => [
  { label: 'Requests today', value: formatNumber(usage.value?.requestsToday ?? 0) },
  { label: 'Requests this month', value: formatNumber(usage.value?.requestsThisMonth ?? 0) },
  { label: 'Input tokens', value: formatNumber(usage.value?.inputTokens ?? 0) },
  { label: 'Output tokens', value: formatNumber(usage.value?.outputTokens ?? 0) },
  { label: 'Total tokens', value: formatNumber(usage.value?.totalTokens ?? 0) },
  { label: 'Average latency', value: `${formatNumber(usage.value?.averageLatency ?? 0)} ms` },
  { label: 'Error rate', value: formatPercent(usage.value?.errorRate ?? 0) },
])
</script>

<template>
  <div class="flex flex-col gap-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-title">Usage</h2>
        <p class="text-caption text-muted-foreground">Tokens, latency, and errors for the period selected.</p>
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

    <section class="divide-border border-border shadow-surface grid divide-y rounded-lg border md:grid-cols-4 md:divide-x md:divide-y-0">
      <div v-for="metric in metrics.slice(0, 4)" :key="metric.label" class="flex flex-col gap-1 p-5">
        <p class="text-caption text-muted-foreground">{{ metric.label }}</p>
        <p class="text-title font-mono">{{ metric.value }}</p>
      </div>
    </section>

    <section class="divide-border border-border shadow-surface grid divide-y rounded-lg border md:grid-cols-3 md:divide-x md:divide-y-0">
      <div v-for="metric in metrics.slice(4)" :key="metric.label" class="flex items-center justify-between gap-4 p-5">
        <span class="text-caption text-muted-foreground">{{ metric.label }}</span>
        <span class="font-mono">{{ metric.value }}</span>
      </div>
    </section>

    <section class="bg-card shadow-surface flex flex-col gap-4 rounded-lg border p-5">
      <h3 class="text-subtitle">Tokens per day</h3>
      <RouterUsageChart :data="tokensByDay" />
    </section>

    <section class="bg-card shadow-surface flex flex-col gap-4 rounded-lg border p-5">
      <h3 class="text-subtitle">Top models</h3>
      <ul v-if="usage?.topModels.length" class="divide-border divide-y">
        <li
          v-for="row in usage.topModels"
          :key="row.model_id"
          class="flex items-center justify-between gap-4 py-2"
        >
          <span class="text-caption font-mono">{{ modelNames.get(row.model_id) ?? 'Removed model' }}</span>
          <span class="text-caption font-mono">{{ formatNumber(row.count) }}</span>
        </li>
      </ul>
      <p v-else class="text-caption text-muted-foreground">No requests in this period.</p>
    </section>

    <section class="bg-card shadow-surface flex flex-col gap-4 rounded-lg border p-5">
      <h3 class="text-subtitle">Recent requests</h3>
      <p class="text-caption text-muted-foreground font-mono">
        Latest {{ Math.min(logs?.items.length ?? 0, 10) }} of {{ formatNumber(usage?.requests ?? 0) }}
      </p>
      <ul v-if="logs?.items.length" class="divide-border divide-y">
        <li
          v-for="row in logs.items.slice(0, 10)"
          :key="row.id"
          class="flex flex-wrap items-center justify-between gap-3 py-2"
        >
          <span class="text-caption font-mono">{{ formatDate(row.created_at) }}</span>
          <span class="text-caption font-mono">{{ modelNames.get(row.model_id ?? '') ?? '—' }}</span>
          <span class="text-caption font-mono">{{ formatNumber(row.total_tokens ?? 0) }} tok</span>
          <Badge :variant="row.status_code < 400 ? 'default' : 'outline'" class="font-mono">
            {{ row.status_code }}
          </Badge>
        </li>
      </ul>
      <p v-else class="text-caption text-muted-foreground">No requests recorded yet.</p>
    </section>
  </div>
</template>
