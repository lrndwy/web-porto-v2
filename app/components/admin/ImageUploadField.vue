<script setup lang="ts">
import { toast } from 'vue-sonner'

const props = defineProps<{
  modelValue: string | null | undefined
  bucket: string
  accept?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [string | null] }>()

const input = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

async function onFile(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const body = new FormData()
    body.append('bucket', props.bucket)
    body.append('file', file)
    const result = await $fetch<{ path: string; publicUrl?: string }>('/api/admin/upload', {
      method: 'POST',
      body,
    })
    emit('update:modelValue', result.publicUrl ?? result.path)
  } catch (error) {
    toast.error(errorMessage(error, 'Upload failed.'))
  } finally {
    uploading.value = false
    // Reset so re-picking the same file still fires a change event.
    target.value = ''
  }
}
</script>

<template>
  <div class="flex items-start gap-3">
    <div
      class="bg-muted border-border flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border"
    >
      <Skeleton v-if="uploading" class="size-full" />
      <img
        v-else-if="props.modelValue"
        :src="props.modelValue"
        alt=""
        class="size-full object-cover"
      >
      <Icon v-else name="ph:image" class="text-muted-foreground size-5" />
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" :disabled="uploading" @click="input?.click()">
          {{ props.modelValue ? 'Replace' : 'Upload' }}
        </Button>
        <Button
          v-if="props.modelValue"
          type="button"
          variant="ghost"
          size="sm"
          :disabled="uploading"
          @click="emit('update:modelValue', null)"
        >
          Clear
        </Button>
      </div>
      <p class="text-caption text-muted-foreground">PNG, JPEG, WebP, or AVIF up to 5 MB.</p>
    </div>

    <input
      ref="input"
      type="file"
      class="sr-only"
      :accept="props.accept ?? 'image/png,image/jpeg,image/webp,image/avif'"
      @change="onFile"
    >
  </div>
</template>
