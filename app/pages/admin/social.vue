<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { socialBlank, socialFields } from '~/lib/resource-forms'
import { socialSchema } from '#shared/schemas/resources'

definePageMeta({ layout: 'admin', title: 'Social Media' })

const columns: ColumnDef[] = [
  { key: 'platform', label: 'Platform' },
  { key: 'username', label: 'Username' },
  { key: 'url', label: 'URL' },
  { key: 'icon', label: 'Icon', mono: true },
]

const dialogOpen = ref(false)
const editing = ref<Record<string, unknown> | null>(null)
const saving = ref(false)
const { create, update } = useResource('socials')

const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(socialSchema),
  initialValues: { ...socialBlank },
})

function openCreate() {
  editing.value = null
  resetForm({ values: { ...socialBlank } })
  dialogOpen.value = true
}

function openEdit(row: Record<string, unknown>) {
  editing.value = row
  resetForm({
    values: {
      ...socialBlank,
      ...row,
      url: String(row.url ?? ''),
      icon: String(row.icon ?? ''),
    },
  })
  dialogOpen.value = true
}

const onSubmit = handleSubmit(async (values) => {
  saving.value = true
  const target = editing.value
  const result = target ? await update(String(target.id), values) : await create(values)
  saving.value = false
  if (result) dialogOpen.value = false
})
</script>

<template>
  <ResourceListPage
    resource="socials"
    title="Social Media"
    description="Links shown in the public nav, hero, and footer."
    :columns="columns"
    :toggles="['is_visible']"
    orderable
    add-label="Add link"
    empty-title="No social links yet."
    empty-body="Add the profiles you want visitors to find."
    @create="openCreate"
    @edit="openEdit"
  >
    <template #dialogs>
      <Dialog v-model:open="dialogOpen">
        <DialogContent class="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{{ editing ? 'Edit social link' : 'Add social link' }}</DialogTitle>
            <DialogDescription>
              The icon name comes from the Phosphor set, for example
              <span class="font-mono">ph:github-logo</span>.
            </DialogDescription>
          </DialogHeader>

          <form novalidate @submit="onSubmit">
            <div class="grid gap-5 py-2">
              <ResourceField v-for="field in socialFields" :key="field.name" :field="field" />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" :disabled="saving" @click="dialogOpen = false">
                Cancel
              </Button>
              <Button type="submit" class="active:translate-y-px" :disabled="saving">
                {{ saving ? 'Saving…' : 'Save' }}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </template>
  </ResourceListPage>
</template>
