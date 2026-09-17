<script setup lang="ts">
import { formatDate } from '#shared/utils/format'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', title: 'Projects' })

interface GithubSettings {
  username: string | null
  max_projects: number
  auto_sync: boolean
  last_synced_at: string | null
}

const { data: settings, refresh: refreshSettings } = await useAsyncData('github-settings', () =>
  $fetch<GithubSettings>('/api/admin/github/settings'),
)

const username = ref('')
const maxProjects = ref(6)
const autoSync = ref(false)
const saving = ref(false)
const syncing = ref(false)

watchEffect(() => {
  if (!settings.value) return
  username.value = settings.value.username ?? ''
  maxProjects.value = settings.value.max_projects
  autoSync.value = settings.value.auto_sync
})

async function saveSettings() {
  saving.value = true
  try {
    await $fetch('/api/admin/github/settings', {
      method: 'PUT',
      body: {
        username: username.value.trim() || null,
        max_projects: Number(maxProjects.value),
        auto_sync: autoSync.value,
      },
    })
    await refreshSettings()
    toast.success('Settings saved.')
  } catch (error) {
    toast.error(errorMessage(error, 'Could not save the GitHub settings.'))
  } finally {
    saving.value = false
  }
}

async function syncNow() {
  syncing.value = true
  try {
    const result = await $fetch<{ synced: number; created: number; updated: number }>(
      '/api/admin/github/sync',
      { method: 'POST' },
    )
    await Promise.all([refreshSettings(), refresh()])
    toast.success(`Synced ${result.synced} repositories.`)
  } catch (error) {
    toast.error(errorMessage(error, 'Sync failed.'))
  } finally {
    syncing.value = false
  }
}

const filter = ref<'all' | 'featured' | 'visible'>('all')

const columns: ColumnDef[] = [
  { key: 'full_name', label: 'Repository' },
  { key: 'language', label: 'Language' },
  { key: 'stars', label: 'Stars', mono: true },
  { key: 'forks', label: 'Forks', mono: true },
  {
    key: 'pushed_at',
    label: 'Pushed',
    mono: true,
    value: (row) => formatDate(row.pushed_at ? String(row.pushed_at) : null),
  },
  { key: 'is_featured', label: 'Featured' },
  { key: 'is_visible', label: 'Visible' },
]

const { items, total, page, pageSize, q, pending, refresh } = useResource('github-repositories', {
  endpoint: '/api/admin/github/repositories',
  extraQuery: () => (filter.value === 'all' ? {} : { [filter.value]: 'true' }),
})

watch(filter, () => {
  page.value = 1
  refresh()
})

const rows = computed(() => items.value as unknown as Record<string, unknown>[])
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

async function move(index: number, direction: -1 | 1) {
  const ids = items.value.map((row) => row.id)
  const target = index + direction
  if (target < 0 || target >= ids.length) return

  const moved = ids[index]
  const displaced = ids[target]
  if (moved === undefined || displaced === undefined) return

  ids[index] = displaced
  ids[target] = moved

  // The repository endpoints have no batch reorder, so every row's order is
  // written directly.
  try {
    await Promise.all(
      ids.map((id, order) =>
        $fetch(`/api/admin/github/repositories/${id}`, {
          method: 'PATCH',
          body: { display_order: order },
        }),
      ),
    )
    await refresh()
  } catch (error) {
    toast.error(errorMessage(error, 'Could not save the new order.'))
    await refresh()
  }
}

onMounted(refresh)
</script>

<template>
  <div class="flex flex-col gap-6">
    <header class="flex flex-col gap-1">
      <h2 class="text-title">Projects</h2>
      <p class="text-caption text-muted-foreground">
        Repositories are mirrored from GitHub; you decide which are visible and featured.
      </p>
    </header>

    <!-- Settings -->
    <section class="bg-card shadow-surface flex flex-col gap-5 rounded-lg border p-5">
      <div class="grid gap-5 md:grid-cols-3">
        <Field>
          <FieldLabel for="github-username">GitHub username</FieldLabel>
          <Input id="github-username" v-model="username" placeholder="octocat" />
        </Field>

        <Field>
          <FieldLabel for="max-projects">Maximum displayed</FieldLabel>
          <Input id="max-projects" v-model="maxProjects" type="number" min="1" max="100" />
          <FieldDescription>Used when deciding which new repositories start visible.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel for="auto-sync">Sync automatically</FieldLabel>
          <div class="flex items-center gap-3">
            <Switch id="auto-sync" v-model="autoSync" />
            <span class="text-caption text-muted-foreground">Every 6 hours via cron</span>
          </div>
        </Field>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <Button class="active:translate-y-px" :disabled="saving" @click="saveSettings">
          {{ saving ? 'Saving…' : 'Save settings' }}
        </Button>
        <Button variant="outline" :disabled="syncing || !settings?.username" @click="syncNow">
          <Icon name="ph:arrows-clockwise" />
          {{ syncing ? 'Syncing…' : 'Sync now' }}
        </Button>
        <span class="text-caption text-muted-foreground font-mono">
          Last synced: {{ formatDate(settings?.last_synced_at ?? null) }}
        </span>
      </div>
    </section>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-2">
      <Input v-model="q" type="search" placeholder="Search repositories…" class="w-full md:w-64" aria-label="Search repositories" />
      <Button
        v-for="option in (['all', 'featured', 'visible'] as const)"
        :key="option"
        size="sm"
        class="capitalize"
        :variant="filter === option ? 'default' : 'outline'"
        :aria-pressed="filter === option"
        @click="filter = option"
      >
        {{ option }}
      </Button>
    </div>

    <ResourceTable
      :columns="columns"
      :rows="rows"
      :pending="pending"
      empty-title="No repositories yet."
      empty-body="Enter a username and run a sync to populate this list."
    >
      <template #cell-full_name="{ row }">
        <a
          :href="String(row.html_url)"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-primary inline-flex items-center gap-1.5 transition-colors duration-200"
        >
          {{ row.full_name }}
          <Icon name="ph:arrow-up-right" class="size-3.5" />
        </a>
      </template>

      <template #cell-is_featured="{ row }">
        <VisibilityToggle
          resource="github-repositories"
          endpoint="/api/admin/github/repositories"
          field="is_featured"
          :id="String(row.id)"
          :model-value="Boolean(row.is_featured)"
          label="Featured"
          @changed="refresh"
        />
      </template>

      <template #cell-is_visible="{ row }">
        <VisibilityToggle
          resource="github-repositories"
          endpoint="/api/admin/github/repositories"
          :id="String(row.id)"
          :model-value="Boolean(row.is_visible)"
          label="Visible"
          @changed="refresh"
        />
      </template>

      <template #row-actions="{ index }">
        <OrderControls :index="index" :count="rows.length" @move="move(index, $event)" />
      </template>
    </ResourceTable>

    <div v-if="total > 0" class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-caption text-muted-foreground font-mono">{{ total }} repositories</p>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" :disabled="page <= 1 || pending" @click="page -= 1">Previous</Button>
        <span class="text-caption text-muted-foreground font-mono">{{ page }} / {{ totalPages }}</span>
        <Button variant="outline" size="sm" :disabled="page >= totalPages || pending" @click="page += 1">Next</Button>
      </div>
    </div>
  </div>
</template>
