<script setup lang="ts">
import { toast } from 'vue-sonner'

const props = defineProps<{
  resource: string
  id: string
  modelValue: boolean
  /** Column to patch; documents have both `is_active` and `is_visible`. */
  field?: string
  /** Base path override, e.g. the GitHub repository endpoints. */
  endpoint?: string
  label?: string
}>()

const emit = defineEmits<{ changed: [boolean] }>()

const pending = ref(false)
const shown = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => (shown.value = value),
)

async function onChange(value: boolean) {
  // Optimistic: the switch moves at once and snaps back if the write fails.
  shown.value = value
  pending.value = true

  const base = props.endpoint ?? `/api/admin/resources/${props.resource}`

  try {
    await $fetch(`${base}/${props.id}`, {
      method: 'PATCH',
      body: { [props.field ?? 'is_visible']: value },
    })
    emit('changed', value)
  } catch (error) {
    shown.value = !value
    toast.error(errorMessage(error, 'Could not update this row.'))
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <Switch
    :model-value="shown"
    :disabled="pending"
    :aria-label="label ? `${label}: ${shown ? 'visible' : 'hidden'}` : shown ? 'Visible' : 'Hidden'"
    @update:model-value="onChange"
  />
</template>
