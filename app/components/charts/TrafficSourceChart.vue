<script setup lang="ts">
import { VisXYContainer, VisGroupedBar, VisAxis, VisTooltip } from '@unovis/vue'

interface Point {
  referrer: string
  visitors: number
}

const props = defineProps<{ data: Point[] }>()

const series = computed(() => (props.data ?? []).slice(0, 8))
const x = (_point: Point, index: number) => index
const y = (point: Point) => point.visitors
const ticks = computed(() => series.value.map((point) => point.referrer))

const tooltip = (point: Point) => `${point.referrer} · ${point.visitors}`
</script>

<template>
  <ClientOnly>
    <div class="h-64 w-full">
      <VisXYContainer :data="series" :height="256">
        <VisGroupedBar :x="x" :y="y" color="var(--chart-2)" />
        <VisAxis type="x" :tick-format="(index: number) => ticks[index] ?? ''" :grid-line="false" />
        <VisAxis type="y" :grid-line="true" />
        <VisTooltip :template="tooltip" />
      </VisXYContainer>
    </div>

    <template #fallback>
      <Skeleton class="h-64 w-full" />
    </template>
  </ClientOnly>
</template>
