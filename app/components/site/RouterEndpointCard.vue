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

// The working key is published by design. Nothing is shown when it is absent:
// a partial key would look usable and fail on the first request.
const displayKey = computed(() => props.info.key ?? null)

/**
 * One restrained accent wash, kept inside the card. Everything else about the
 * card stays quiet so the gradient is the only thing doing decorative work.
 */
const wash = {
  background: 'radial-gradient(ellipse 70% 120% at 0% 0%, var(--primary), transparent 58%)',
}
</script>

<template>
  <!-- Double bezel: a hairline shell around an inner core with concentric radii. -->
  <div class="border-border/70 bg-muted/25 shadow-surface rounded-3xl border p-1.5">
    <div
      class="border-border/60 bg-card relative overflow-hidden rounded-[calc(1.5rem-0.375rem)] border"
      :class="props.wide ? 'px-6 py-8 md:px-10 md:py-10' : 'p-5'"
    >
      <div class="pointer-events-none absolute inset-0 opacity-[0.11]" :style="wash" aria-hidden="true" />

      <div class="relative">
        <template v-if="props.wide">
          <div class="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-12">
            <!-- Endpoint + key, left aligned -->
            <div class="flex flex-col gap-5">
              <div class="flex flex-col gap-1">
                <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">
                  Endpoint
                </p>
                <div class="flex items-start gap-2">
                  <p class="text-base font-mono break-all md:text-lg">{{ props.info.endpoint }}</p>
                  <CopyButton :value="props.info.endpoint" label="Copy endpoint URL" />
                </div>
              </div>

              <div v-if="displayKey" class="flex flex-col gap-1">
                <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">
                  Public key
                </p>
                <div class="flex items-start gap-2">
                  <p class="text-caption font-mono break-all select-all">{{ displayKey }}</p>
                  <CopyButton :value="displayKey" label="Copy the public key" />
                </div>
              </div>
            </div>

            <!-- Status + quota, right -->
            <div class="flex flex-col gap-4 lg:border-border/60 lg:border-l lg:pl-10">
              <StatusDot label="Operational" />

              <div class="flex flex-col gap-2">
                <div class="flex items-baseline justify-between gap-4">
                  <span class="text-caption text-muted-foreground">Models</span>
                  <span class="font-mono text-sm">{{ props.info.models.length }}</span>
                </div>
                <div class="flex items-baseline justify-between gap-4">
                  <span class="text-caption text-muted-foreground">Tokens remaining</span>
                  <span class="font-mono text-sm">{{ formatNumber(props.info.quota.remaining) }}</span>
                </div>
              </div>

              <Progress :model-value="percentUsed" />

              <Button shape="pill" as-child variant="outline" class="w-fit rounded-full active:scale-[0.98]">
                <NuxtLink to="/router">
                  Open the router
                  <Icon name="ph:arrow-right" />
                </NuxtLink>
              </Button>
            </div>
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

          <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <StatusDot label="Operational" />
            <span class="text-caption text-muted-foreground font-mono">
              {{ props.info.models.length }} models available
            </span>
          </div>

          <div class="mt-4 flex flex-col gap-2">
            <Progress :model-value="percentUsed" />
            <p class="text-caption text-muted-foreground font-mono">
              {{ formatNumber(props.info.quota.used) }} / {{ formatNumber(props.info.quota.limit) }} tokens
              · {{ formatNumber(props.info.quota.remaining) }} remaining
            </p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
