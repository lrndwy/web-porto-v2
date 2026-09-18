<script setup lang="ts">
const { data: info, pending } = await useAsyncData('router-page-info', () =>
  $fetch<RouterInfo>('/api/router/info'),
)

useSeo({
  title: 'AI Router',
  description: 'One endpoint, multiple AI providers, with an owner-controlled quota.',
})

// The working key is published by design: the router is a demo endpoint, so a
// visitor needs a key that actually works. Absent means no complete key has been
// issued yet — never render or copy a partial value, because a truncated key
// looks usable and then fails at the first request.
const displayKey = computed(() => info.value?.key ?? null)

const model = computed(() => info.value?.models[0]?.display_name ?? 'model-name')
const key = computed(() => info.value?.key ?? '$PUBLIC_KEY')

const openaiExample = computed(
  () => `curl ${info.value?.openaiEndpoint ?? 'https://example.com/v1/chat/completions'} \\
  -H "Authorization: Bearer ${key.value}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model.value}",
    "messages": [{ "role": "user", "content": "Hello" }]
  }'`,
)

const anthropicExample = computed(
  () => `curl ${info.value?.anthropicEndpoint ?? 'https://example.com/v1/messages'} \\
  -H "x-api-key: ${key.value}" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model.value}",
    "max_tokens": 256,
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
      <Skeleton class="h-40 w-full" />
    </div>

    <template v-else-if="info?.enabled">
      <div class="flex flex-col gap-3">
        <SectionHeading
          overline="Infrastructure"
          title="One endpoint. Multiple AI providers."
        />
        <StatusDot label="Operational" />
      </div>

      <!-- Endpoint bar: the single thing a visitor needs first. -->
      <div
        class="bg-card shadow-surface mt-10 flex flex-col gap-4 rounded-xl border p-5 md:flex-row md:items-center md:justify-between md:gap-8 md:p-6"
      >
        <div class="flex min-w-0 flex-col gap-1">
          <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">Endpoint</p>
          <p class="font-mono text-base break-all md:text-lg">{{ info.endpoint }}</p>
        </div>
        <CopyButton :value="info.endpoint" label="Copy the gateway base URL" />
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div class="flex min-w-0 flex-col gap-6">
          <!-- Public key -->
          <div class="bg-card shadow-surface flex min-w-0 flex-col gap-3 rounded-xl border p-5">
            <div class="flex items-start justify-between gap-3">
              <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">
                Public API key
              </p>
              <CopyButton v-if="displayKey" :value="displayKey" label="Copy the public key" />
            </div>

            <p v-if="displayKey" class="font-mono text-sm break-all select-all">{{ displayKey }}</p>
            <p v-else class="text-caption text-muted-foreground">
              No key is published yet. The owner can generate one in the dashboard.
            </p>

            <p class="text-caption text-muted-foreground">
              This key is meant to be shared — it identifies this portfolio, not an upstream account.
              Provider secrets never leave the server.
            </p>
          </div>

          <!-- Examples: one per supported request shape. -->
          <div class="flex min-w-0 flex-col gap-3">
            <div class="flex items-center justify-between gap-3">
              <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">
                OpenAI-compatible
              </p>
              <CopyButton :value="openaiExample" label="Copy the OpenAI example" />
            </div>
            <pre
              class="border-border bg-muted/70 w-full min-w-0 overflow-x-auto rounded-xl border p-5 font-mono text-sm leading-relaxed"
            >{{ openaiExample }}</pre>
          </div>

          <div class="flex min-w-0 flex-col gap-3">
            <div class="flex items-center justify-between gap-3">
              <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">
                Anthropic-compatible
              </p>
              <CopyButton :value="anthropicExample" label="Copy the Anthropic example" />
            </div>
            <pre
              class="border-border bg-muted/70 w-full min-w-0 overflow-x-auto rounded-xl border p-5 font-mono text-sm leading-relaxed"
            >{{ anthropicExample }}</pre>
          </div>
        </div>

        <div class="flex min-w-0 flex-col gap-6">
          <!-- Quota -->
          <div class="bg-card shadow-surface flex flex-col gap-4 rounded-xl border p-5">
            <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">Usage</p>
            <Progress :model-value="percentUsed" />
            <dl class="divide-border divide-y">
              <div class="flex items-baseline justify-between gap-4 py-2">
                <dt class="text-caption text-muted-foreground">Used</dt>
                <dd class="font-mono text-sm">{{ formatNumber(info.quota.used) }}</dd>
              </div>
              <div class="flex items-baseline justify-between gap-4 py-2">
                <dt class="text-caption text-muted-foreground">Limit</dt>
                <dd class="font-mono text-sm">{{ formatNumber(info.quota.limit) }}</dd>
              </div>
              <div class="flex items-baseline justify-between gap-4 py-2">
                <dt class="text-caption text-muted-foreground">Remaining</dt>
                <dd class="font-mono text-sm">{{ formatNumber(info.quota.remaining) }}</dd>
              </div>
            </dl>
          </div>

          <!-- Models -->
          <div class="bg-card shadow-surface flex flex-col gap-3 rounded-xl border p-5">
            <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">
              Available models
            </p>
            <ul v-if="info.models.length" class="divide-border divide-y">
              <li
                v-for="model in info.models"
                :key="model.display_name"
                class="flex items-center justify-between gap-4 py-3"
              >
                <div class="flex min-w-0 flex-col">
                  <span class="truncate font-mono text-sm">{{ model.display_name }}</span>
                  <span class="text-caption text-muted-foreground">{{ model.provider_name }}</span>
                </div>
                <StatusDot />
              </li>
            </ul>
            <p v-else class="text-caption text-muted-foreground">No models are available right now.</p>
          </div>
        </div>
      </div>

      <div class="text-caption text-muted-foreground measure mt-12 flex flex-col gap-2">
        <p>
          Requests are counted per key against the owner's monthly token quota and the per-minute,
          hourly, and daily request limits. Responses are buffered before they are returned, so
          streaming is not offered.
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
            <Button shape="pill" as-child variant="outline" class="active:translate-y-px">
              <NuxtLink to="/">Back home</NuxtLink>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </template>
  </SectionShell>
</template>
