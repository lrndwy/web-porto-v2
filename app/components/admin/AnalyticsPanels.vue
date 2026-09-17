<script setup lang="ts">
import { formatNumber, formatPercent } from '#shared/utils/format'

interface Overview {
  visitors: number
  visitorsDelta: number
  pageViews: number
  pageViewsDelta: number
  sessions: number
  sessionsDelta: number
  blogPosts: number
  projects: number
  aiRequests: number
  aiTokens: number
  aiErrors: number
  routerEnabled: boolean
  quota: { limit: number; used: number; remaining: number }
}

const props = defineProps<{ range: PeriodRange }>()

const VisitorTrendChart = defineAsyncComponent(() => import('~/components/charts/VisitorTrendChart.vue'))
const TrafficSourceChart = defineAsyncComponent(() => import('~/components/charts/TrafficSourceChart.vue'))
const TopPagesTable = defineAsyncComponent(() => import('~/components/charts/TopPagesTable.vue'))

const query = computed(() => ({ range: props.range }))

const { data: overview } = await useFetch<Overview>('/api/admin/dashboard/overview', { query })
const { data: timeseries } = await useFetch<{ date: string; visitors: number; pageviews: number; sessions: number }[]>(
  '/api/admin/analytics/timeseries',
  { query },
)
const { data: topPages } = await useFetch<{ path: string; views: number; visitors: number }[]>(
  '/api/admin/analytics/top-pages',
  { query: { ...query.value, limit: 8 } },
)
const { data: sources } = await useFetch<{ referrer: string; visitors: number; percentage: number }[]>(
  '/api/admin/analytics/sources',
  { query },
)
const { data: devices } = await useFetch<{
  device_type: Record<string, number>
  browser: Record<string, number>
  os: Record<string, number>
}>('/api/admin/analytics/devices', { query })

const kpis = computed(() => {
  const data = overview.value
  if (!data) return []
  return [
    { label: 'Visitors', value: formatNumber(data.visitors), delta: data.visitorsDelta },
    { label: 'Page Views', value: formatNumber(data.pageViews), delta: data.pageViewsDelta },
    { label: 'Sessions', value: formatNumber(data.sessions), delta: data.sessionsDelta },
    {
      label: 'AI Tokens',
      value: formatNumber(data.aiTokens),
      delta: data.quota.limit > 0 ? data.quota.used / data.quota.limit : 0,
      deltaLabel: `${formatPercent(data.quota.limit > 0 ? data.quota.used / data.quota.limit : 0)} used`,
    },
  ]
})

const breakdowns = computed(() => [
  { label: 'Devices', values: devices.value?.device_type ?? {} },
  { label: 'Browsers', values: devices.value?.browser ?? {} },
  { label: 'Operating systems', values: devices.value?.os ?? {} },
])
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- KPI row: one bordered surface grouped by dividers, not floating cards. -->
    <section class="divide-border border-border shadow-surface grid divide-y rounded-lg border md:grid-cols-4 md:divide-x md:divide-y-0">
      <div v-for="kpi in kpis" :key="kpi.label" class="flex flex-col gap-1 p-5">
        <p class="text-caption text-muted-foreground">{{ kpi.label }}</p>
        <p class="text-title font-mono">{{ kpi.value }}</p>
        <p class="text-caption font-mono text-muted-foreground">
          {{ kpi.deltaLabel ?? formatPercent(kpi.delta, 1) }}
        </p>
      </div>
      <template v-if="!kpis.length">
        <div v-for="index in 4" :key="index" class="flex flex-col gap-2 p-5">
          <Skeleton class="h-3 w-20" />
          <Skeleton class="h-7 w-24" />
        </div>
      </template>
    </section>

    <!-- Secondary counters -->
    <section class="divide-border border-border shadow-surface grid divide-y rounded-lg border md:grid-cols-4 md:divide-x md:divide-y-0">
      <div class="flex items-center justify-between gap-4 p-5">
        <span class="text-caption text-muted-foreground">Published articles</span>
        <span class="font-mono">{{ overview?.blogPosts ?? '—' }}</span>
      </div>
      <div class="flex items-center justify-between gap-4 p-5">
        <span class="text-caption text-muted-foreground">Visible projects</span>
        <span class="font-mono">{{ overview?.projects ?? '—' }}</span>
      </div>
      <div class="flex items-center justify-between gap-4 p-5">
        <span class="text-caption text-muted-foreground">AI requests</span>
        <span class="font-mono">{{ overview?.aiRequests ?? '—' }}</span>
      </div>
      <div class="flex items-center justify-between gap-4 p-5">
        <span class="text-caption text-muted-foreground">Router</span>
        <StatusDot
          :tone="overview?.routerEnabled ? 'primary' : 'muted'"
          :label="overview?.routerEnabled ? 'Operational' : 'Disabled'"
        />
      </div>
    </section>

    <section class="bg-card shadow-surface flex flex-col gap-4 rounded-lg border p-5">
      <h3 class="text-subtitle">Visitor trend</h3>
      <VisitorTrendChart :data="timeseries ?? []" />
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="bg-card shadow-surface flex flex-col gap-4 rounded-lg border p-5">
        <h3 class="text-subtitle">Top pages</h3>
        <TopPagesTable :rows="topPages ?? []" />
        <p v-if="!topPages?.length" class="text-caption text-muted-foreground">No page views in this period.</p>
      </section>

      <section class="bg-card shadow-surface flex flex-col gap-4 rounded-lg border p-5">
        <h3 class="text-subtitle">Traffic sources</h3>
        <TrafficSourceChart :data="sources ?? []" />
        <p v-if="!sources?.length" class="text-caption text-muted-foreground">No sessions in this period.</p>
      </section>
    </div>

    <!-- Devices, browsers, and OS as compact rows: not charts, not cards. -->
    <section class="divide-border border-border shadow-surface grid divide-y rounded-lg border md:grid-cols-3 md:divide-x md:divide-y-0">
      <div v-for="breakdown in breakdowns" :key="breakdown.label" class="p-5">
        <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">{{ breakdown.label }}</p>
        <ul v-if="Object.keys(breakdown.values).length" class="divide-border mt-2 divide-y">
          <li
            v-for="[name, count] in Object.entries(breakdown.values)"
            :key="name"
            class="flex items-center justify-between gap-4 py-2"
          >
            <span class="text-caption capitalize">{{ name }}</span>
            <span class="text-caption font-mono">{{ formatNumber(count) }}</span>
          </li>
        </ul>
        <p v-else class="text-caption text-muted-foreground mt-2">Nothing recorded yet.</p>
      </div>
    </section>
  </div>
</template>
