<script setup lang="ts">
definePageMeta({ layout: 'admin', title: 'Experience' })

const router = useRouter()

const columns: ColumnDef[] = [
  { key: 'title', label: 'Role' },
  { key: 'organization', label: 'Organisation' },
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
    value: (row) =>
      row.is_current ? 'Present' : formatDate(row.end_date ? String(row.end_date) : null),
  },
]

const openCreate = () => router.push('/admin/experience/new')
const openEdit = (row: Record<string, unknown>) => router.push(`/admin/experience/${row.id}`)
</script>

<template>
  <ResourceListPage
    resource="experience"
    title="Experience"
    description="Roles shown on the public timeline."
    :columns="columns"
    :toggles="['is_visible']"
    orderable
    add-label="Add experience"
    empty-title="No roles yet."
    empty-body="Add your first role and it appears on the public timeline."
    @create="openCreate"
    @edit="openEdit"
  />
</template>
