<script setup lang="ts">
import { formatDate } from '#shared/utils/format'

definePageMeta({ layout: 'admin', title: 'Blog' })

interface PostRow {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  updated_at: string
  blog_categories: { name: string } | null
}

const status = ref<'all' | 'draft' | 'published' | 'archived'>('all')

const columns: ColumnDef[] = [
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category', value: (row) => (row.blog_categories as { name?: string } | null)?.name ?? '—' },
  { key: 'status', label: 'Status' },
  {
    key: 'published_at',
    label: 'Published',
    mono: true,
    value: (row) => formatDate(row.published_at ? String(row.published_at) : null),
  },
  {
    key: 'updated_at',
    label: 'Updated',
    mono: true,
    value: (row) => formatDate(row.updated_at ? String(row.updated_at) : null),
  },
]

const { items, total, page, pageSize, q, pending, refresh } = useResource('blog-posts', {
  endpoint: '/api/admin/blog/posts',
  extraQuery: () => (status.value === 'all' ? {} : { status: status.value }),
})

watch(status, () => {
  page.value = 1
  refresh()
})

const rows = computed(() => items.value as unknown as Record<string, unknown>[])
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

const router = useRouter()
onMounted(refresh)
</script>

<template>
  <div class="flex flex-col gap-6">
    <header class="flex flex-col gap-1">
      <h2 class="text-title">Blog</h2>
      <p class="text-caption text-muted-foreground">Drafts stay private until they are published.</p>
    </header>

    <div class="flex flex-wrap items-center gap-2">
      <Input v-model="q" type="search" placeholder="Search articles…" class="w-full md:w-64" aria-label="Search articles" />
      <Button
        v-for="option in (['all', 'draft', 'published', 'archived'] as const)"
        :key="option"
        size="sm"
        class="capitalize"
        :variant="status === option ? 'default' : 'outline'"
        :aria-pressed="status === option"
        @click="status = option"
      >
        {{ option }}
      </Button>
      <Button as-child class="ml-auto active:translate-y-px">
        <NuxtLink to="/admin/blog/new">
          <Icon name="ph:plus" />
          New article
        </NuxtLink>
      </Button>
    </div>

    <ResourceTable
      :columns="columns"
      :rows="rows"
      :pending="pending"
      empty-title="No articles yet."
      empty-body="Create your first article to start building your developer blog."
    >
      <template #cell-title="{ row }">
        <NuxtLink :to="`/admin/blog/${row.id}`" class="hover:text-primary transition-colors duration-200">
          {{ row.title }}
        </NuxtLink>
      </template>

      <template #cell-status="{ row }">
        <Badge :variant="row.status === 'published' ? 'default' : 'outline'" class="capitalize">
          {{ row.status }}
        </Badge>
      </template>

      <template #row-actions="{ row }">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Edit"
          @click="router.push(`/admin/blog/${row.id}`)"
        >
          <Icon name="ph:pencil-simple" />
        </Button>
        <Button
          v-if="row.slug"
          as-child
          variant="ghost"
          size="icon-sm"
          aria-label="View on site"
        >
          <a :href="`/blog/${row.slug}`" target="_blank" rel="noopener noreferrer">
            <Icon name="ph:arrow-up-right" />
          </a>
        </Button>
      </template>
    </ResourceTable>

    <div v-if="total > 0" class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-caption text-muted-foreground font-mono">{{ total }} articles</p>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" :disabled="page <= 1 || pending" @click="page -= 1">Previous</Button>
        <span class="text-caption text-muted-foreground font-mono">{{ page }} / {{ totalPages }}</span>
        <Button variant="outline" size="sm" :disabled="page >= totalPages || pending" @click="page += 1">Next</Button>
      </div>
    </div>
  </div>
</template>
