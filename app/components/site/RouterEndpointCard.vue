<script setup lang="ts">
import { formatNumber } from '#shared/utils/format'
const props = defineProps<{ info: RouterInfo; condensed?: boolean }>()

const percentUsed = computed(() => {
  const { limit, used } = props.info.quota
  if (limit <= 0) return 0
  return Math.min(100, Math.round((used / limit) * 100))
})
</script>

<template>
  <div class="bg-card shadow-surface flex flex-col gap-4 rounded-lg border p-5">
    <div class="flex items-start justify-between gap-3">
      <div class="flex min-w-0 flex-col gap-1">
        <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">
          Endpoint
        </p>
        <p class="truncate font-mono text-sm">{{ props.info.endpoint }}</p>
      </div>
      <CopyButton :value="props.info.endpoint" label="Copy endpoint URL" />
    </div>

    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <StatusDot label="Operational" />
      <span class="text-caption text-muted-foreground font-mono">
        {{ props.info.models.length }} models available
      </span>
    </div>

    <div v-if="!props.condensed" class="flex flex-col gap-2">
      <Progress :model-value="percentUsed" />
      <p class="text-caption text-muted-foreground font-mono">
        {{ formatNumber(props.info.quota.used) }} / {{ formatNumber(props.info.quota.limit) }} tokens
        · {{ formatNumber(props.info.quota.remaining) }} remaining
      </p>
    </div>
  </div>
</template>
