<script setup lang="ts">
import type { ZodType } from 'zod'

const props = defineProps<{
  resource: string
  title: string
  description?: string
  schema: ZodType
  fields: FieldDef[]
  blank: Record<string, unknown>
  redirectTo: string
  id?: string
}>()

const router = useRouter()
const { create, update } = useResource(props.resource)

const submitting = ref(false)
const loaded = ref<Record<string, unknown> | null>(null)
const loadError = ref('')

// File metadata is not a visible form control, so it is carried alongside the
// validated values and merged in on submit.
const fileMeta = ref<Record<string, unknown>>({})

onMounted(async () => {
  if (!props.id) {
    loaded.value = { ...props.blank }
    return
  }
  try {
    loaded.value = await $fetch<Record<string, unknown>>(
      `/api/admin/resources/${props.resource}/${props.id}`,
    )
  } catch (error) {
    loadError.value = errorMessage(error, 'Could not load this row.')
  }
})

// Empty inputs need '' rather than null, so a blank date box is not rendered
// as the string "null".
const initial = computed(() => {
  const values: Record<string, unknown> = { ...props.blank, ...(loaded.value ?? {}) }
  for (const field of props.fields) {
    const current = values[field.name]
    if (current === null || current === undefined) {
      values[field.name] = field.type === 'switch' ? false : ''
    }
  }
  return values
})

function onFileUploaded(file: { path: string; file_type: string; file_size: number } | null) {
  fileMeta.value = file ? { file_type: file.file_type, file_size: file.file_size } : {}
}

async function onSubmit(values: Record<string, unknown>) {
  submitting.value = true
  const payload = { ...values, ...fileMeta.value }
  const result = props.id ? await update(props.id, payload) : await create(payload)
  submitting.value = false
  if (result) await router.push(props.redirectTo)
}
</script>

<template>
  <div v-if="loadError" class="mx-auto max-w-md py-16">
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon name="ph:warning" />
        </EmptyMedia>
        <EmptyTitle>Could not load this row.</EmptyTitle>
        <EmptyDescription>{{ loadError }}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button as-child variant="outline" class="active:translate-y-px">
          <NuxtLink :to="props.redirectTo">Back to the list</NuxtLink>
        </Button>
      </EmptyContent>
    </Empty>
  </div>

  <div v-else-if="!loaded" class="flex flex-col gap-4">
    <Skeleton class="h-8 w-48" />
    <Skeleton class="h-64 w-full" />
  </div>

  <ResourceFormShell
    v-else
    :key="String(loaded.id ?? 'new')"
    :title="props.title"
    :description="props.description"
    :schema="props.schema"
    :initial="initial"
    :submitting="submitting"
    :submit-label="props.id ? 'Save changes' : 'Create'"
    @submit="onSubmit"
    @cancel="router.push(props.redirectTo)"
  >
    <template v-for="field in props.fields" :key="field.name">
      <ResourceField
        v-if="field.type === 'file'"
        :field="field"
        @file-uploaded="onFileUploaded"
      />
      <ResourceField v-else :field="field" />
    </template>
  </ResourceFormShell>
</template>
