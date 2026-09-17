<script setup lang="ts">
import { formatDate } from '#shared/utils/format'

definePageMeta({ layout: 'admin', title: 'Logs' })

interface LogRow extends AiUsageLogRow {
  ai_models: { display_name: string } | null
  ai_providers: { name: string } | null
}

const page = ref(1)
const pageSize = ref(50)
const statusFilter = ref('')

const { data, pending, refresh } = await useFetch<{
  items: LogRow[]
  total: number
  page: number
  pageSize: number
}>('/api/admin/router/logs', {
  query: computed(() => ({
    page: page.value,
    pageSize: pageSize.value,
    status: statusFilter.value || undefined,
  })),
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil((data.value?.total ?? 0) / (data.value?.pageSize ?? 50))),
)

const columns: ColumnDef[] = [
  { key: 'created_at', label: 'Time', mono: true, value: (row) => formatDate(String(row.created_at)) },
  { key: 'request_id', label: 'Request ID', mono: true },
  { key: 'provider', label: 'Provider', value: (row) => (row.ai_providers as { name?: string } | null)?.name ?? '—' },
  { key: 'model', label: 'Model', value: (row) => (row.ai_models as { display_name?: string } | null)?.display_name ?? '—' },
  { key: 'total_tokens', label: 'Tokens', mono: true },
  { key: 'status_code', label: 'Status', mono: true },
  { key: 'latency_ms', label: 'Latency', mono: true, value: (row) => `${row.latency_ms ?? 0} ms` },
]

const rows = computed(() => (data.value?.items ?? []) as unknown as Record<string, unknown>[])
const selected = ref<LogRow | null>(null)
</script>

<template>
  <div class="flex flex-col gap-6">
    <header class="flex flex-col gap-1">
      <h2 class="text-title">Logs</h2>
      <p class="text-caption text-muted-foreground">
        One row per router request. Prompt and response bodies are never stored.
      </p>
    </header>

    <div class="flex flex-wrap items-center gap-2">
      <Select :model-value="statusFilter" @update:model-value="statusFilter = String($event)">
        <SelectTrigger class="w-40" aria-label="Filter by status">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All statuses</SelectItem>
          <SelectItem value="200">200</SelectItem>
          <SelectItem value="402">402</SelectItem>
          <SelectItem value="429">429</SelectItem>
          <SelectItem value="502">502</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" :disabled="pending" @click="refresh">Refresh</Button>
    </div>

    <ResourceTable
      :columns="columns"
      :rows="rows"
      :pending="pending"
      empty-title="No requests yet."
      empty-body="Requests appear here as soon as the public key is used."
    >
      <template #cell-status_code="{ row }">
        <Badge :variant="Number(row.status_code) < 400 ? 'default' : 'outline'" class="font-mono">
          {{ row.status_code }}
        </Badge>
      </template>

      <template #row-actions="{ row }">
        <Button variant="ghost" size="sm" @click="selected = row as unknown as LogRow">Inspect</Button>
      </template>
    </ResourceTable>

    <div v-if="(data?.total ?? 0) > 0" class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-caption text-muted-foreground font-mono">
        {{ data?.total }} requests
      </p>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" :disabled="page <= 1 || pending" @click="page -= 1">Previous</Button>
        <span class="text-caption text-muted-foreground font-mono">{{ page }} / {{ totalPages }}</span>
        <Button variant="outline" size="sm" :disabled="page >= totalPages || pending" @click="page += 1">Next</Button>
      </div>
    </div>

    <Sheet :open="!!selected" @update:open="(open) => (!open ? (selected = null) : null)">
      <SheetContent class="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Request detail</SheetTitle>
          <SheetDescription>
            Prompt and response bodies are not stored, so they cannot be shown here.
          </SheetDescription>
        </SheetHeader>

        <dl v-if="selected" class="divide-border mt-6 divide-y">
          <div
            v-for="entry in [
              { label: 'Request ID', value: selected.request_id },
              { label: 'Time', value: selected.created_at },
              { label: 'Provider', value: selected.ai_providers?.name ?? '—' },
              { label: 'Model', value: selected.ai_models?.display_name ?? '—' },
              { label: 'Status', value: String(selected.status_code) },
              { label: 'Error code', value: selected.error_code ?? '—' },
              { label: 'Input tokens', value: String(selected.input_tokens) },
              { label: 'Output tokens', value: String(selected.output_tokens) },
              { label: 'Total tokens', value: String(selected.total_tokens) },
              { label: 'Latency', value: `${selected.latency_ms ?? 0} ms` },
            ]"
            :key="entry.label"
            class="flex items-center justify-between gap-4 py-3"
          >
            <dt class="text-caption text-muted-foreground">{{ entry.label }}</dt>
            <dd class="text-caption font-mono text-right break-all">{{ entry.value }}</dd>
          </div>
        </dl>
      </SheetContent>
    </Sheet>
  </div>
</template>
