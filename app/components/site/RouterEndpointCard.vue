<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    info: RouterInfo
    /** Full-width composition used on the homepage. */
    wide?: boolean
  }>(),
  { wide: false },
)

const percentUsed = computed(() => {
  const { limit, used } = props.info.quota
  if (limit <= 0) return 0
  return Math.min(100, Math.round((used / limit) * 100))
})

// The working key is published by design; the prefix is the fallback for keys
// created before the plaintext column existed.
const displayKey = computed(() => props.info.key ?? (props.info.key_prefix ? `${props.info.key_prefix}…` : null))
const copyValue = computed(() => props.info.key ?? props.info.key_prefix ?? '')

const stats = computed(() => [
  { label: 'Models available', value: String(props.info.models.length) },
  { label: 'Tokens used', value: formatNumber(props.info.quota.used) },
  { label: 'Tokens remaining', value: formatNumber(props.info.quota.remaining) },
])
</script>

<template>
  <div
    class="bg-card shadow-surface flex flex-col rounded-xl border"
    :class="props.wide ? 'gap-8 p-6 md:p-10' : 'gap-4 p-5'"
  >
    <template v-if="props.wide">
      <div class="flex flex-col items-center gap-4 text-center">
        <StatusDot label="Operational" />
        <p class="text-base font-mono break-all md:text-lg">{{ props.info.endpoint }}</p>
        <div class="flex items-center gap-2">
          <CopyButton :value="props.info.endpoint" label="Copy endpoint URL" />
          <span class="text-caption text-muted-foreground">Copy the endpoint</span>
        </div>
      </div>

      <div class="divide-border border-border grid divide-y border-t md:grid-cols-3 md:divide-x md:divide-y-0">
        <div class="flex flex-col items-center gap-2 px-4 py-6">
          <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">Public key</p>
          <p v-if="displayKey" class="font-mono text-sm break-all">{{ displayKey }}</p>
          <p v-else class="text-caption text-muted-foreground">No active key</p>
          <CopyButton v-if="displayKey" :value="copyValue" label="Copy the public key" />
        </div>

        <div
          v-for="stat in stats"
          :key="stat.label"
          class="flex flex-col items-center justify-center gap-1 px-4 py-6"
        >
          <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">{{ stat.label }}</p>
          <p class="text-subtitle font-mono">{{ stat.value }}</p>
        </div>
      </div>

      <div class="flex flex-col items-center gap-3">
        <Progress :model-value="percentUsed" class="w-full max-w-md" />
        <p class="text-caption text-muted-foreground font-mono">
          {{ formatNumber(props.info.quota.used) }} / {{ formatNumber(props.info.quota.limit) }} tokens
          this month
        </p>
        <Button as-child class="active:translate-y-px">
          <NuxtLink to="/router">
            Open the router
            <Icon name="ph:arrow-right" />
          </NuxtLink>
        </Button>
      </div>
    </template>

    <template v-else>
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 flex-col gap-1">
          <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">Endpoint</p>
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

      <div class="flex flex-col gap-2">
        <Progress :model-value="percentUsed" />
        <p class="text-caption text-muted-foreground font-mono">
          {{ formatNumber(props.info.quota.used) }} / {{ formatNumber(props.info.quota.limit) }} tokens
          · {{ formatNumber(props.info.quota.remaining) }} remaining
        </p>
      </div>
    </template>
  </div>
</template>
