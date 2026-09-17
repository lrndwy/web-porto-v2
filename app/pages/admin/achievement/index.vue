<script setup lang="ts">
definePageMeta({ layout: 'admin', title: 'Achievement' })

const router = useRouter()

const columns: ColumnDef[] = [
  { key: 'title', label: 'Achievement' },
  { key: 'issuer', label: 'Issuer' },
  {
    key: 'achievement_date',
    label: 'Date',
    mono: true,
    value: (row) => formatDate(row.achievement_date ? String(row.achievement_date) : null),
  },
]

const openCreate = () => router.push('/admin/achievement/new')
const openEdit = (row: Record<string, unknown>) => router.push(`/admin/achievement/${row.id}`)
</script>

<template>
  <ResourceListPage
    resource="achievement"
    title="Achievement"
    description="Awards and certificates."
    :columns="columns"
    :toggles="['is_visible']"
    orderable
    add-label="Add achievement"
    empty-title="No achievements yet."
    empty-body="Add an award and it appears on the public achievement grid."
    @create="openCreate"
    @edit="openEdit"
  />
</template>
