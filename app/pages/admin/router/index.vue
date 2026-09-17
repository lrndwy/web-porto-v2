<script setup lang="ts">
import { formatNumber } from '#shared/utils/format'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', title: 'AI Router' })

interface RouterSettings {
  is_enabled: boolean
  monthly_token_limit: number
  requests_per_minute: number
  requests_per_hour: number
  requests_per_day: number
  quota_exceeded_message: string
}

const { data: settings, refresh } = await useAsyncData('admin-router-settings', () =>
  $fetch<RouterSettings>('/api/admin/router/settings'),
)

const { data: info } = await useAsyncData('admin-router-info', () =>
  $fetch<RouterInfo>('/api/router/info'),
)

const form = reactive<RouterSettings>({
  is_enabled: false,
  monthly_token_limit: 100000,
  requests_per_minute: 10,
  requests_per_hour: 120,
  requests_per_day: 1000,
  quota_exceeded_message: '',
})

watchEffect(() => {
  if (settings.value) Object.assign(form, settings.value)
})

const saving = ref(false)

async function save() {
  saving.value = true
  try {
    await $fetch('/api/admin/router/settings', { method: 'PUT', body: { ...form } })
    await Promise.all([refresh(), refreshNuxtData('admin-router-info')])
    toast.success('Settings saved.')
  } catch (error) {
    toast.error(errorMessage(error, 'Could not save the router settings.'))
  } finally {
    saving.value = false
  }
}

const quotaUsedPercent = computed(() => {
  if (!info.value || info.value.quota.limit <= 0) return 0
  return Math.min(100, Math.round((info.value.quota.used / info.value.quota.limit) * 100))
})

const LIMITS: { key: keyof RouterSettings; label: string; hint: string }[] = [
  { key: 'monthly_token_limit', label: 'Monthly token limit', hint: '0 means unlimited.' },
  { key: 'requests_per_minute', label: 'Requests per minute', hint: 'Per public key. 0 means unlimited.' },
  { key: 'requests_per_hour', label: 'Requests per hour', hint: '0 means unlimited.' },
  { key: 'requests_per_day', label: 'Requests per day', hint: '0 means unlimited.' },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-title">AI Router</h2>
        <p class="text-caption text-muted-foreground font-mono">{{ info?.endpoint }}</p>
      </div>
      <StatusDot :label="form.is_enabled ? 'Operational' : 'Disabled'" />
    </header>

    <!-- KPIs -->
    <section class="divide-border border-border shadow-surface grid divide-y rounded-lg border md:grid-cols-3 md:divide-x md:divide-y-0">
      <div class="flex flex-col gap-1 p-5">
        <p class="text-caption text-muted-foreground">Tokens used this month</p>
        <p class="text-title font-mono">{{ formatNumber(info?.quota.used ?? 0) }}</p>
      </div>
      <div class="flex flex-col gap-1 p-5">
        <p class="text-caption text-muted-foreground">Monthly limit</p>
        <p class="text-title font-mono">{{ formatNumber(info?.quota.limit ?? 0) }}</p>
      </div>
      <div class="flex flex-col gap-1 p-5">
        <p class="text-caption text-muted-foreground">Remaining</p>
        <p class="text-title font-mono">{{ formatNumber(info?.quota.remaining ?? 0) }}</p>
      </div>
    </section>

    <section class="bg-card shadow-surface flex flex-col gap-4 rounded-lg border p-5">
      <Progress :model-value="quotaUsedPercent" />
      <p class="text-caption text-muted-foreground font-mono">
        {{ quotaUsedPercent }}% of the monthly quota consumed ·
        {{ formatNumber(info?.models.length ?? 0) }} active models
      </p>
    </section>

    <!-- Settings -->
    <section class="bg-card shadow-surface flex flex-col gap-5 rounded-lg border p-5">
      <h3 class="text-subtitle">Settings</h3>

      <Field>
        <FieldLabel for="router-enabled">Router enabled</FieldLabel>
        <div class="flex items-center gap-3">
          <Switch id="router-enabled" v-model="form.is_enabled" />
          <span class="text-caption text-muted-foreground">
            When off, the public endpoint refuses requests and the nav item is hidden.
          </span>
        </div>
      </Field>

      <div class="grid gap-5 md:grid-cols-2">
        <Field v-for="limit in LIMITS" :key="limit.key">
          <FieldLabel :for="String(limit.key)">{{ limit.label }}</FieldLabel>
          <Input :id="String(limit.key)" v-model.number="form[limit.key] as number" type="number" min="0" />
          <FieldDescription>{{ limit.hint }}</FieldDescription>
        </Field>
      </div>

      <Field>
        <FieldLabel for="quota-message">Quota exhausted message</FieldLabel>
        <Textarea id="quota-message" v-model="form.quota_exceeded_message" :rows="2" />
        <FieldDescription>Returned verbatim when the token quota is spent.</FieldDescription>
      </Field>

      <div>
        <Button class="active:translate-y-px" :disabled="saving" @click="save">
          {{ saving ? 'Saving…' : 'Save settings' }}
        </Button>
      </div>
    </section>
  </div>
</template>
