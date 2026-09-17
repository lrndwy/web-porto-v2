<script setup lang="ts">
import { toast } from 'vue-sonner'

const props = defineProps<{
  modelValue: string | null | undefined
  bucket: string
}>()

const emit = defineEmits<{
  'update:modelValue': [string | null]
  /** Everything the documents table needs: path plus stored file metadata. */
  uploaded: [file: { path: string; file_type: string; file_size: number } | null]
}>()

const input = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

const fileName = computed(() => props.modelValue?.split('/').pop() ?? null)

async function onFile(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const body = new FormData()
    body.append('bucket', props.bucket)
    body.append('file', file)
    const result = await $fetch<{ path: string }>('/api/admin/upload', { method: 'POST', body })

    emit('update:modelValue', result.path)
    emit('uploaded', { path: result.path, file_type: file.type, file_size: file.size })
  } catch (error) {
    toast.error(errorMessage(error, 'Upload failed.'))
  } finally {
    uploading.value = false
    target.value = ''
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" :disabled="uploading" @click="input?.click()">
        <Icon name="ph:upload-simple" />
        {{ props.modelValue ? 'Replace PDF' : 'Upload PDF' }}
      </Button>
      <Button
        v-if="props.modelValue"
        type="button"
        variant="ghost"
        size="sm"
        :disabled="uploading"
        @click="emit('update:modelValue', null); emit('uploaded', null)"
      >
        Clear
      </Button>
      <Skeleton v-if="uploading" class="h-4 w-32" />
      <span v-else-if="fileName" class="text-caption text-muted-foreground font-mono truncate">
        {{ fileName }}
      </span>
    </div>
    <p class="text-caption text-muted-foreground">PDF up to 5 MB.</p>

    <input
      ref="input"
      type="file"
      class="sr-only"
      accept="application/pdf"
      @change="onFile"
    >
  </div>
</template>
