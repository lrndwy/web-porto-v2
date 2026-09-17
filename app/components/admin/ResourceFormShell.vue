<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import type { ZodType } from 'zod'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    schema: ZodType
    initial: Record<string, unknown>
    submitting?: boolean
    submitLabel?: string
  }>(),
  { submitting: false, submitLabel: 'Save' },
)

const emit = defineEmits<{
  submit: [values: Record<string, unknown>]
  cancel: []
}>()

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(props.schema),
  initialValues: props.initial,
})

const onSubmit = handleSubmit((values) => emit('submit', values))
</script>

<template>
  <form class="flex flex-col gap-6" novalidate @submit="onSubmit">
    <header class="flex flex-col gap-1">
      <h2 class="text-title">{{ props.title }}</h2>
      <p v-if="props.description" class="text-caption text-muted-foreground">
        {{ props.description }}
      </p>
    </header>

    <!-- Single column below md, two columns above. -->
    <div class="grid gap-5 md:grid-cols-2">
      <slot />
    </div>

    <div class="bg-background/95 sticky bottom-0 flex flex-wrap items-center gap-2 border-t py-3 backdrop-blur">
      <Button type="submit" class="active:translate-y-px" :disabled="props.submitting">
        {{ props.submitting ? 'Saving…' : props.submitLabel }}
      </Button>
      <Button type="button" variant="ghost" :disabled="props.submitting" @click="emit('cancel')">
        Cancel
      </Button>
      <slot name="actions" />
    </div>
  </form>
</template>
