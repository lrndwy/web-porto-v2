<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', title: 'Models' })

interface ModelRow {
  id: string
  provider_id: string
  model_name: string
  display_name: string
  input_price: number | null
  output_price: number | null
  is_active: boolean
  ai_providers: { name: string } | null
}

const { data: models, refresh } = await useAsyncData('admin-models', () =>
  $fetch<ModelRow[]>('/api/admin/router/models'),
)

const { data: providers } = await useAsyncData('admin-provider-options', () =>
  $fetch<{ id: string; name: string }[]>('/api/admin/router/providers'),
)

const providerFilter = ref<'all' | string>('all')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

const filtered = computed(() =>
  (models.value ?? []).filter((model) => {
    if (providerFilter.value !== 'all' && model.provider_id !== providerFilter.value) return false
    if (statusFilter.value === 'active' && !model.is_active) return false
    if (statusFilter.value === 'inactive' && model.is_active) return false
    return true
  }),
)

const dialogOpen = ref(false)
const saving = ref(false)
const editing = ref<ModelRow | null>(null)

const form = reactive({
  provider_id: '',
  model_name: '',
  display_name: '',
  input_price: '' as string | number,
  output_price: '' as string | number,
  is_active: true,
})

function openCreate() {
  editing.value = null
  Object.assign(form, {
    provider_id: providers.value?.[0]?.id ?? '',
    model_name: '',
    display_name: '',
    input_price: '',
    output_price: '',
    is_active: true,
  })
  dialogOpen.value = true
}

function openEdit(model: ModelRow) {
  editing.value = model
  Object.assign(form, {
    provider_id: model.provider_id,
    model_name: model.model_name,
    display_name: model.display_name,
    input_price: model.input_price ?? '',
    output_price: model.output_price ?? '',
    is_active: model.is_active,
  })
  dialogOpen.value = true
}

async function save() {
  saving.value = true
  try {
    const body = {
      provider_id: form.provider_id,
      model_name: form.model_name.trim(),
      display_name: form.display_name.trim(),
      input_price: form.input_price === '' ? null : Number(form.input_price),
      output_price: form.output_price === '' ? null : Number(form.output_price),
      is_active: form.is_active,
    }

    if (editing.value) {
      await $fetch(`/api/admin/router/models/${editing.value.id}`, { method: 'PATCH', body })
    } else {
      await $fetch('/api/admin/router/models', { method: 'POST', body })
    }
    await refresh()
    dialogOpen.value = false
    toast.success('Model saved.')
  } catch (error) {
    toast.error(errorMessage(error, 'Could not save the model.'))
  } finally {
    saving.value = false
  }
}

const removeTarget = ref<ModelRow | null>(null)
// The action dialog closes before the click handler runs, which clears the
// selected row; the id is captured separately so the delete still fires.
const removeTargetId = ref<string | null>(null)

function requestRemove(model: ModelRow) {
  removeTarget.value = model
  removeTargetId.value = model.id
}

async function confirmRemove() {
  const id = removeTargetId.value
  if (!id) return
  removeTarget.value = null
  removeTargetId.value = null
  try {
    await $fetch(`/api/admin/router/models/${id}`, { method: 'DELETE' })
    await refresh()
    toast.success('Model deleted.')
  } catch (error) {
    toast.error(errorMessage(error, 'Could not delete the model.'))
  }
}

function pricing(model: ModelRow) {
  if (model.input_price === null && model.output_price === null) return '—'
  return `${model.input_price ?? '—'} / ${model.output_price ?? '—'}`
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-col gap-1">
        <h2 class="text-title">Models</h2>
        <p class="text-caption text-muted-foreground">
          Clients address models by display name, so it must be unique.
        </p>
      </div>
      <Button class="active:translate-y-px" :disabled="!providers?.length" @click="openCreate">
        <Icon name="ph:plus" />
        Add model
      </Button>
    </header>

    <div class="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        :variant="statusFilter === 'all' ? 'default' : 'outline'"
        :aria-pressed="statusFilter === 'all'"
        @click="statusFilter = 'all'"
      >
        All
      </Button>
      <Button
        size="sm"
        :variant="statusFilter === 'active' ? 'default' : 'outline'"
        :aria-pressed="statusFilter === 'active'"
        @click="statusFilter = 'active'"
      >
        Active
      </Button>
      <Button
        size="sm"
        :variant="statusFilter === 'inactive' ? 'default' : 'outline'"
        :aria-pressed="statusFilter === 'inactive'"
        @click="statusFilter = 'inactive'"
      >
        Inactive
      </Button>
      <Button
        v-for="provider in providers ?? []"
        :key="provider.id"
        size="sm"
        :variant="providerFilter === provider.id ? 'default' : 'outline'"
        :aria-pressed="providerFilter === provider.id"
        @click="providerFilter = provider.id"
      >
        {{ provider.name }}
      </Button>
    </div>

    <div class="bg-card shadow-surface overflow-hidden rounded-lg border">
      <Table v-if="filtered.length">
        <TableHeader>
          <TableRow>
            <TableHead>Model</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="font-mono">Pricing (in / out)</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="model in filtered" :key="model.id">
            <TableCell>
              <span class="font-mono">{{ model.display_name }}</span>
              <span v-if="model.model_name !== model.display_name" class="text-caption text-muted-foreground ml-2">
                {{ model.model_name }}
              </span>
            </TableCell>
            <TableCell>{{ model.ai_providers?.name ?? '—' }}</TableCell>
            <TableCell>
              <Badge :variant="model.is_active ? 'default' : 'outline'">
                {{ model.is_active ? 'Active' : 'Inactive' }}
              </Badge>
            </TableCell>
            <TableCell class="font-mono">{{ pricing(model) }}</TableCell>
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon-sm" aria-label="Edit" @click="openEdit(model)">
                  <Icon name="ph:pencil-simple" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete"
                  class="text-destructive hover:text-destructive"
                  @click="requestRemove(model)"
                >
                  <Icon name="ph:trash" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Empty v-else>
        <EmptyHeader>
          <EmptyMedia variant="icon"><Icon name="ph:cube" /></EmptyMedia>
          <EmptyTitle>No models to show.</EmptyTitle>
          <EmptyDescription>
            <template v-if="models?.length">No model matches the current filter.</template>
            <template v-else>Add a provider first, then register the models it offers.</template>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ editing ? 'Edit model' : 'Add model' }}</DialogTitle>
        </DialogHeader>

        <div class="grid gap-5 py-2">
          <Field>
            <FieldLabel for="model-provider">Provider</FieldLabel>
            <Select :model-value="form.provider_id" @update:model-value="form.provider_id = String($event)">
              <SelectTrigger id="model-provider" class="w-full">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="provider in providers ?? []" :key="provider.id" :value="provider.id">
                  {{ provider.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel for="model-name">Upstream model name</FieldLabel>
            <Input id="model-name" v-model="form.model_name" placeholder="gpt-4o-mini" />
          </Field>

          <Field>
            <FieldLabel for="model-display">Display name</FieldLabel>
            <Input id="model-display" v-model="form.display_name" placeholder="gpt-4o-mini" />
            <FieldDescription>What clients send as <span class="font-mono">model</span>. Must be unique.</FieldDescription>
          </Field>

          <div class="grid gap-5 md:grid-cols-2">
            <Field>
              <FieldLabel for="model-input">Input price</FieldLabel>
              <Input id="model-input" v-model="form.input_price" type="number" step="0.01" min="0" placeholder="0.15" />
            </Field>
            <Field>
              <FieldLabel for="model-output">Output price</FieldLabel>
              <Input id="model-output" v-model="form.output_price" type="number" step="0.01" min="0" placeholder="0.60" />
            </Field>
          </div>

          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel for="model-active">Active</FieldLabel>
              <FieldDescription>Inactive models are refused by the router.</FieldDescription>
            </FieldContent>
            <Switch id="model-active" v-model="form.is_active" />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="ghost" :disabled="saving" @click="dialogOpen = false">Cancel</Button>
          <Button class="active:translate-y-px" :disabled="saving" @click="save">
            {{ saving ? 'Saving…' : 'Save' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog :open="!!removeTarget" @update:open="(open) => (!open ? (removeTarget = null) : null)">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this model?</AlertDialogTitle>
          <AlertDialogDescription>
            Models with recorded usage cannot be deleted; deactivate them instead.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive text-white hover:bg-destructive/90" @click="confirmRemove">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
