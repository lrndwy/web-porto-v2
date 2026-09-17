<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    resource: string
    title: string
    description?: string
    columns: ColumnDef[]
    emptyTitle: string
    emptyBody: string
    searchPlaceholder?: string
    addLabel?: string
    /** Boolean columns rendered as an immediate-write switch. */
    toggles?: string[]
    /** Show up/down controls backed by `display_order`. */
    orderable?: boolean
  }>(),
  {
    searchPlaceholder: 'Search…',
    addLabel: 'Add',
    toggles: () => [],
    orderable: false,
  },
)

const emit = defineEmits<{ create: []; edit: [row: Record<string, unknown>] }>()

const { items, total, page, pageSize, q, pending, refresh, remove, reorder } =
  useResource(props.resource)

const TOGGLE_LABELS: Record<string, string> = {
  is_visible: 'Visible',
  is_active: 'Active',
}

const rows = computed(() => items.value as unknown as Record<string, unknown>[])

const columns = computed<ColumnDef[]>(() => [
  ...props.columns,
  ...props.toggles.map((key) => ({ key, label: TOGGLE_LABELS[key] ?? key })),
  ...(props.orderable ? [{ key: 'display_order', label: 'Order' }] : []),
])

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const firstRow = computed(() => (total.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1))
const lastRow = computed(() => Math.min(page.value * pageSize.value, total.value))

async function move(index: number, direction: -1 | 1) {
  const ids = items.value.map((row) => row.id)
  const target = index + direction
  if (target < 0 || target >= ids.length) return

  const moved = ids[index]
  const displaced = ids[target]
  if (moved === undefined || displaced === undefined) return

  ids[index] = displaced
  ids[target] = moved
  await reorder(ids)
}

const deleteTarget = ref<Record<string, unknown> | null>(null)
// reka-ui closes the action dialog before the click handler runs, which clears
// `deleteTarget`; the id is captured separately so the delete still fires.
const deleteId = ref<string | null>(null)
const deleting = ref(false)

function requestDelete(row: Record<string, unknown>) {
  deleteTarget.value = row
  deleteId.value = String(row.id)
}

async function confirmDelete() {
  if (!deleteId.value) return
  deleting.value = true
  const ok = await remove(deleteId.value)
  deleting.value = false
  if (ok) {
    deleteTarget.value = null
    deleteId.value = null
  }
}

onMounted(refresh)
</script>

<template>
  <div class="flex flex-col gap-6">
    <header class="flex flex-col gap-1">
      <h2 class="text-title">{{ props.title }}</h2>
      <p v-if="props.description" class="text-caption text-muted-foreground">{{ props.description }}</p>
    </header>

    <div class="flex flex-wrap items-center gap-2">
      <Input
        v-model="q"
        type="search"
        :placeholder="props.searchPlaceholder"
        class="w-full md:w-64"
        :aria-label="props.searchPlaceholder"
      />
      <slot name="filters" />
      <Button class="ml-auto active:translate-y-px" @click="emit('create')">
        <Icon name="ph:plus" />
        {{ props.addLabel }}
      </Button>
    </div>

    <ResourceTable
      :columns="columns"
      :rows="rows"
      :pending="pending"
      :empty-title="props.emptyTitle"
      :empty-body="props.emptyBody"
    >
      <template v-for="key in props.toggles" #[`cell-${key}`]="{ row }">
        <VisibilityToggle
          :resource="props.resource"
          :id="String(row.id)"
          :field="key"
          :model-value="Boolean(row[key])"
          :label="TOGGLE_LABELS[key] ?? key"
          @changed="refresh"
        />
      </template>

      <template v-if="props.orderable" #cell-display_order="{ index }">
        <OrderControls :index="index" :count="rows.length" @move="move(index, $event)" />
      </template>

      <template #row-actions="{ row }">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Edit"
          @click="emit('edit', row)"
        >
          <Icon name="ph:pencil-simple" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Delete"
          class="text-destructive hover:text-destructive"
          @click="requestDelete(row)"
        >
          <Icon name="ph:trash" />
        </Button>
      </template>
    </ResourceTable>

    <div v-if="total > 0" class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-caption text-muted-foreground font-mono">
        {{ firstRow }}–{{ lastRow }} of {{ total }}
      </p>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="page <= 1 || pending"
          @click="page -= 1"
        >
          Previous
        </Button>
        <span class="text-caption text-muted-foreground font-mono">{{ page }} / {{ totalPages }}</span>
        <Button
          variant="outline"
          size="sm"
          :disabled="page >= totalPages || pending"
          @click="page += 1"
        >
          Next
        </Button>
      </div>
    </div>

    <AlertDialog :open="!!deleteTarget" @update:open="(open) => (!open ? (deleteTarget = null) : null)">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this row?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes it from the public site immediately and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="deleting">Cancel</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-white hover:bg-destructive/90"
            :disabled="deleting"
            @click="confirmDelete"
          >
            {{ deleting ? 'Deleting…' : 'Delete' }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <slot name="dialogs" :refresh="refresh" />
  </div>
</template>
