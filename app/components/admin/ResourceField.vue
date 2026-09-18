<script setup lang="ts">
import { useField } from 'vee-validate'

const props = defineProps<{ field: FieldDef }>()

const emit = defineEmits<{
  'file-uploaded': [file: { path: string; file_type: string; file_size: number } | null]
}>()

const { value, errorMessage } = useField<string | number | boolean | null>(
  () => props.field.name,
)

// Every control writes through `value`; reads go through these two projections
// so a `boolean` field and a `string` field can share one component.
const textValue = computed(() => (value.value === null ? '' : String(value.value)))
const boolValue = computed(() => value.value === true)
const urlValue = computed(() => (value.value === null ? null : String(value.value)))

const wide = computed(() => props.field.wide || props.field.type === 'textarea')

/** reka-ui's select emits an `AcceptableValue`, which is wider than a form value. */
function onSelect(next: unknown) {
  value.value =
    typeof next === 'string' ? next : next === null || next === undefined ? null : String(next)
}
</script>

<template>
  <!--
    A switch is a horizontal row: the label and description take the free
    space and the control keeps its intrinsic width. The vertical `Field`
    would stretch the switch to `w-full`, which is what made the toggle look
    broken.
  -->
  <Field
    v-if="props.field.type === 'switch'"
    orientation="horizontal"
    class="md:col-span-2"
    :data-invalid="errorMessage ? true : undefined"
  >
    <FieldContent>
      <FieldLabel :for="props.field.name">{{ props.field.label }}</FieldLabel>
      <FieldDescription v-if="props.field.description">{{ props.field.description }}</FieldDescription>
      <FieldError :errors="errorMessage ? [errorMessage] : []" />
    </FieldContent>
    <Switch
      :id="props.field.name"
      :model-value="boolValue"
      :aria-invalid="errorMessage ? true : undefined"
      @update:model-value="value = $event"
    />
  </Field>

  <Field v-else :class="wide ? 'md:col-span-2' : ''" :data-invalid="errorMessage ? true : undefined">
    <FieldLabel :for="props.field.name">{{ props.field.label }}</FieldLabel>

    <Input
      v-if="['text', 'url', 'email', 'date'].includes(props.field.type)"
      :id="props.field.name"
      :model-value="textValue"
      :type="props.field.type"
      :placeholder="props.field.placeholder"
      :aria-invalid="errorMessage ? true : undefined"
      @update:model-value="value = $event"
    />

    <Textarea
      v-else-if="props.field.type === 'textarea'"
      :id="props.field.name"
      :model-value="textValue"
      :rows="props.field.rows ?? 6"
      :placeholder="props.field.placeholder"
      :aria-invalid="errorMessage ? true : undefined"
      @update:model-value="value = $event"
    />

    <Select
      v-else-if="props.field.type === 'select'"
      :model-value="textValue"
      @update:model-value="onSelect"
    >
      <SelectTrigger :id="props.field.name" class="w-full">
        <SelectValue :placeholder="props.field.placeholder ?? 'Select…'" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="option in props.field.options ?? []"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </SelectItem>
      </SelectContent>
    </Select>

    <ImageUploadField
      v-else-if="props.field.type === 'image'"
      :model-value="urlValue"
      :bucket="props.field.bucket ?? 'site-assets'"
      @update:model-value="value = $event"
    />

    <FileUploadField
      v-else-if="props.field.type === 'file'"
      :model-value="urlValue"
      :bucket="props.field.bucket ?? 'documents'"
      @update:model-value="value = $event"
      @uploaded="emit('file-uploaded', $event)"
    />

    <FieldDescription v-if="props.field.description">{{ props.field.description }}</FieldDescription>
    <FieldError :errors="errorMessage ? [errorMessage] : []" />
  </Field>
</template>
