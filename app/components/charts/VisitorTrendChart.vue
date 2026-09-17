<script setup lang="ts">
import { VisXYContainer, VisLine, VisAxis, VisCrosshair, VisTooltip } from '@unovis/vue'

interface Point {
  date: string
  visitors: number
  pageviews: number
  sessions: number
}

const props = defineProps<{ data: Point[] }>()

const series = computed(() => props.data ?? [])
const x = (point: Point, index: number) => index
const y = (point: Point) => point.visitors

const ticks = computed(() =>
  series.value.map((point) => point.date.slice(5)),
)

const tooltip = (point: Point) => `${point.date} · ${point.visitors} visitors`
</script>

<template>
  <ClientOnly>
    <div class="h-64 w-full">
      <VisXYContainer :data="series" :height="256">
        <VisLine :x="x" :y="y" color="var(--chart-1)" :line-width="2" />
        <VisAxis type="x" :tick-format="(index: number) => ticks[index] ?? ''" :grid-line="false" />
        <VisAxis type="y" :grid-line="true" />
        <VisCrosshair :template="tooltip" />
        <VisTooltip />
      </VisXYContainer>
    </div>

    <template #fallback>
      <Skeleton class="h-64 w-full" />
    </template>
  </ClientOnly>
</template>
