<script setup lang="ts">
definePageMeta({ layout: 'admin', title: 'Documents' })

const router = useRouter()

const columns: ColumnDef[] = [
  { key: 'name', label: 'Name' },
  { key: 'version', label: 'Version', mono: true },
  { key: 'file_type', label: 'Type', mono: true },
  {
    key: 'created_at',
    label: 'Uploaded',
    mono: true,
    value: (row) => formatDate(row.created_at ? String(row.created_at) : null),
  },
]

const openCreate = () => router.push('/admin/documents/new')
const openEdit = (row: Record<string, unknown>) => router.push(`/admin/documents/${row.id}`)
</script>

<template>
  <ResourceListPage
    resource="documents"
    title="Documents"
    description="CV files offered on the public /cv page."
    :columns="columns"
    :toggles="['is_active', 'is_visible']"
    add-label="Upload document"
    empty-title="No documents yet."
    empty-body="Upload a PDF and it becomes available for download on /cv."
    @create="openCreate"
    @edit="openEdit"
  />
</template>
