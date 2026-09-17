<script setup lang="ts">
const props = defineProps<{
  columns: ColumnDef[]
  rows: Record<string, unknown>[]
  pending: boolean
  emptyTitle: string
  emptyBody: string
  page?: number
  pageSize?: number
  total?: number
}>()

function cellText(column: ColumnDef, row: Record<string, unknown>): string {
  if (column.value) return column.value(row)
  const raw = row[column.key]
  if (raw === null || raw === undefined || raw === '') return '—'
  return String(raw)
}

const skeletonRows = computed(() => Array.from({ length: 4 }, (_, index) => index))
const columnCount = computed(() => props.columns.length + 1)
</script>

<template>
  <div class="bg-card shadow-surface overflow-hidden rounded-lg border">
    <!-- Loading: skeleton rows matching the column count. -->
    <div v-if="props.pending && props.rows.length === 0" class="divide-y">
      <div
        v-for="row in skeletonRows"
        :key="row"
        class="flex items-center gap-4 px-4 py-3"
      >
        <Skeleton v-for="column in columnCount" :key="column" class="h-4 flex-1" />
      </div>
    </div>

    <div v-else-if="props.rows.length === 0">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon name="ph:tray" />
          </EmptyMedia>
          <EmptyTitle>{{ props.emptyTitle }}</EmptyTitle>
          <EmptyDescription>{{ props.emptyBody }}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <slot name="empty-action" />
        </EmptyContent>
      </Empty>
    </div>

    <template v-else>
      <!-- Desktop table -->
      <div class="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                v-for="column in props.columns"
                :key="column.key"
                :class="[column.class, column.mono ? 'font-mono' : '']"
              >
                {{ column.label }}
              </TableHead>
              <TableHead class="w-px text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="(row, index) in props.rows" :key="String(row.id)">
              <TableCell
                v-for="column in props.columns"
                :key="column.key"
                :class="[column.class, column.mono ? 'font-mono' : '']"
              >
                <slot :name="`cell-${column.key}`" :row="row" :index="index">
                  {{ cellText(column, row) }}
                </slot>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex items-center justify-end gap-1">
                  <slot name="row-actions" :row="row" :index="index" />
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Mobile: stacked cards, never a horizontally scrolling table. -->
      <ul class="divide-y md:hidden">
        <li v-for="(row, index) in props.rows" :key="String(row.id)" class="p-4">
          <div class="flex flex-col gap-2">
            <div v-for="column in props.columns" :key="column.key" class="flex items-start justify-between gap-4">
              <span class="text-caption text-muted-foreground">{{ column.label }}</span>
              <span
                class="text-right"
                :class="[column.class, column.mono ? 'font-mono' : '']"
              >
                <slot :name="`cell-${column.key}`" :row="row" :index="index">
                  {{ cellText(column, row) }}
                </slot>
              </span>
            </div>
            <div class="mt-1 flex items-center justify-end gap-1">
              <slot name="row-actions" :row="row" :index="index" />
            </div>
          </div>
        </li>
      </ul>
    </template>
  </div>
</template>
