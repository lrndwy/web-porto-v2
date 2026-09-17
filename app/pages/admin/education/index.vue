<script setup lang="ts">
definePageMeta({ layout: 'admin', title: 'Education' })

const router = useRouter()

const columns: ColumnDef[] = [
  { key: 'institution', label: 'Institution' },
  { key: 'degree', label: 'Degree' },
  {
    key: 'start_date',
    label: 'Start',
    mono: true,
    value: (row) => formatDate(row.start_date ? String(row.start_date) : null),
  },
  {
    key: 'end_date',
    label: 'End',
    mono: true,
    value: (row) => formatDate(row.end_date ? String(row.end_date) : null),
  },
]

const openCreate = () => router.push('/admin/education/new')
const openEdit = (row: Record<string, unknown>) => router.push(`/admin/education/${row.id}`)
</script>

<template>
  <ResourceListPage
    resource="education"
    title="Education"
    description="Degrees and programmes."
    :columns="columns"
    :toggles="['is_visible']"
    orderable
    add-label="Add education"
    empty-title="No education yet."
    empty-body="Add a programme and it appears on the public education timeline."
    @create="openCreate"
    @edit="openEdit"
  />
</template>
