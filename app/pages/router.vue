<script setup lang="ts">
import { formatNumber } from '#shared/utils/format'
const { data: info, pending } = await useAsyncData('router-page-info', () =>
  $fetch<RouterInfo>('/api/router/info'),
)

useSeo({
  title: 'AI Router',
  description: 'One endpoint, multiple AI providers, with an owner-controlled quota.',
})

const curlExample = computed(
  () => `curl ${info.value?.endpoint ?? 'https://example.com/api/router'} \\
  -H "Authorization: Bearer ${info.value?.key_prefix ?? 'pk_portfolio_xxx'}..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${info.value?.models[0]?.display_name ?? 'model-name'}",
    "messages": [{ "role": "user", "content": "Hello" }]
  }'`,
)

const percentUsed = computed(() => {
  if (!info.value || info.value.quota.limit <= 0) return 0
  return Math.min(100, Math.round((info.value.quota.used / info.value.quota.limit) * 100))
})
</script>

<template>
  <SectionShell id="router">
    <div v-if="pending" class="flex flex-col gap-4">
      <Skeleton class="h-8 w-48" />
      <Skeleton class="h-40 w-full max-w-xl" />
    </div>

    <template v-else-if="info?.enabled">
      <SectionHeading
        overline="Infrastructure"
        title="AI Router"
        description="One endpoint. Multiple AI providers. A quota the owner controls."
      />

      <div class="mt-6">
        <StatusDot label="Operational" />
      </div>

      <div class="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div class="flex flex-col gap-6">
          <div class="bg-card shadow-surface flex flex-col gap-4 rounded-lg border p-5">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 flex-col gap-1">
                <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">Endpoint</p>
                <p class="truncate font-mono text-sm">{{ info.endpoint }}</p>
              </div>
              <CopyButton :value="info.endpoint" label="Copy endpoint URL" />
            </div>

            <div v-if="info.key_prefix" class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 flex-col gap-1">
                <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">Public key</p>
                <p class="truncate font-mono text-sm">{{ info.key_prefix }}…</p>
              </div>
              <CopyButton :value="info.key_prefix" label="Copy key prefix" />
            </div>
          </div>

          <div class="bg-card shadow-surface flex flex-col gap-3 rounded-lg border p-5">
            <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">Usage</p>
            <Progress :model-value="percentUsed" />
            <p class="text-caption text-muted-foreground font-mono">
              {{ formatNumber(info.quota.used) }} / {{ formatNumber(info.quota.limit) }} tokens ·
              {{ formatNumber(info.quota.remaining) }} remaining
            </p>
          </div>

          <div class="flex flex-col gap-3">
            <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">Example</p>
            <pre class="border-border bg-muted overflow-x-auto rounded-lg border p-4 font-mono text-sm">{{ curlExample }}</pre>
            <CopyButton :value="curlExample" label="Copy the curl example" class="self-start" />
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">Available models</p>
          <ul class="divide-border divide-y">
            <li
              v-for="model in info.models"
              :key="model.display_name"
              class="flex items-center justify-between gap-4 py-3"
            >
              <div class="flex flex-col">
                <span class="font-mono text-sm">{{ model.display_name }}</span>
                <span class="text-caption text-muted-foreground">{{ model.provider_name }}</span>
              </div>
              <StatusDot label="Available" />
            </li>
          </ul>

          <p v-if="!info.models.length" class="text-body text-muted-foreground">
            No models are available right now.
          </p>
        </div>
      </div>

      <div class="text-caption text-muted-foreground measure mt-12 flex flex-col gap-2">
        <p>
          The public key above is meant to be shareable: it identifies this portfolio, not an
          upstream account. Provider secrets never leave the server and are never returned by any
          API.
        </p>
        <p>
          Requests are accounted per key against the owner's monthly token quota and per-minute,
          hourly, and daily request limits. Streaming responses are buffered before they are
          returned.
        </p>
      </div>
    </template>

    <template v-else>
      <SectionHeading overline="Infrastructure" title="AI Router" />
      <div class="mt-10">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Icon name="ph:sparkle" /></EmptyMedia>
            <EmptyTitle>Router is currently unavailable.</EmptyTitle>
            <EmptyDescription>
              The owner has switched the public router off. The rest of the site is unaffected.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button as-child variant="outline" class="active:translate-y-px">
              <NuxtLink to="/">Back home</NuxtLink>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </template>
  </SectionShell>
</template>
