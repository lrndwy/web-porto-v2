<script setup lang="ts">
import { toast } from 'vue-sonner'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'

const props = defineProps<{ modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [unknown] }>()

const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const editor = useEditor({
  // TipTap v3 creates the editor on mount, so no SSR guard is needed.
  content: (props.modelValue as object | null) ?? undefined,
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false }),
    Image,
    Placeholder.configure({ placeholder: 'Write the article…' }),
  ],
  editorProps: {
    attributes: {
      class: 'tiptap-content min-h-[50dvh] focus:outline-none',
    },
  },
  onUpdate: ({ editor: instance }) => emit('update:modelValue', instance.getJSON()),
})

// The form can replace the value wholesale (loading an existing article).
watch(
  () => props.modelValue,
  (value) => {
    const instance = editor.value
    if (!instance) return
    const incoming = value ? JSON.stringify(value) : ''
    if (incoming === JSON.stringify(instance.getJSON())) return
    instance.commands.setContent((value as object | null) ?? '', { emitUpdate: false })
  },
)

onBeforeUnmount(() => editor.value?.destroy())

const active = (name: string, attributes?: Record<string, unknown>) =>
  editor.value?.isActive(name, attributes) ?? false

function toggleLink() {
  const previous = editor.value?.getAttributes('link').href as string | undefined
  const url = window.prompt('Link URL', previous ?? 'https://')
  if (url === null) return
  if (!url) {
    editor.value?.chain().focus().unsetLink().run()
    return
  }
  editor.value?.chain().focus().setLink({ href: url }).run()
}

async function uploadImage(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const body = new FormData()
    body.append('bucket', 'blog-images')
    body.append('file', file)
    const result = await $fetch<{ publicUrl?: string; path: string }>('/api/admin/upload', {
      method: 'POST',
      body,
    })
    const src = result.publicUrl ?? result.path
    editor.value?.chain().focus().setImage({ src }).run()
  } catch (error) {
    toast.error(errorMessage(error, 'Could not upload the image.'))
  } finally {
    uploading.value = false
    target.value = ''
  }
}

interface ToolbarButton {
  label: string
  icon: string
  action: () => void
  isActive: () => boolean
  disabled?: boolean
}

const buttons = computed<ToolbarButton[]>(() => [
  { label: 'Bold', icon: 'ph:text-b', action: () => editor.value?.chain().focus().toggleBold().run(), isActive: () => active('bold') },
  { label: 'Italic', icon: 'ph:text-italic', action: () => editor.value?.chain().focus().toggleItalic().run(), isActive: () => active('italic') },
  { label: 'Strikethrough', icon: 'ph:text-strikethrough', action: () => editor.value?.chain().focus().toggleStrike().run(), isActive: () => active('strike') },
  { label: 'Heading 2', icon: 'ph:text-h-two', action: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => active('heading', { level: 2 }) },
  { label: 'Heading 3', icon: 'ph:text-h-three', action: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => active('heading', { level: 3 }) },
  { label: 'Bullet list', icon: 'ph:list-bullets', action: () => editor.value?.chain().focus().toggleBulletList().run(), isActive: () => active('bulletList') },
  { label: 'Numbered list', icon: 'ph:list-numbers', action: () => editor.value?.chain().focus().toggleOrderedList().run(), isActive: () => active('orderedList') },
  { label: 'Quote', icon: 'ph:quotes', action: () => editor.value?.chain().focus().toggleBlockquote().run(), isActive: () => active('blockquote') },
  { label: 'Code block', icon: 'ph:code', action: () => editor.value?.chain().focus().toggleCodeBlock().run(), isActive: () => active('codeBlock') },
  { label: 'Divider', icon: 'ph:minus', action: () => editor.value?.chain().focus().setHorizontalRule().run(), isActive: () => false },
  { label: 'Link', icon: 'ph:link', action: toggleLink, isActive: () => active('link') },
  { label: 'Image', icon: 'ph:image', action: () => fileInput.value?.click(), isActive: () => false, disabled: uploading.value },
  { label: 'Undo', icon: 'ph:arrow-u-up-left', action: () => editor.value?.chain().focus().undo().run(), isActive: () => false, disabled: !editor.value?.can().undo() },
  { label: 'Redo', icon: 'ph:arrow-u-up-right', action: () => editor.value?.chain().focus().redo().run(), isActive: () => false, disabled: !editor.value?.can().redo() },
])
</script>

<template>
  <div class="border-border bg-card overflow-hidden rounded-lg border">
    <div class="border-border flex flex-wrap items-center gap-0.5 border-b p-1.5" role="toolbar" aria-label="Formatting">
      <Button
        v-for="button in buttons"
        :key="button.label"
        type="button"
        variant="ghost"
        size="icon-sm"
        :aria-label="button.label"
        :aria-pressed="button.isActive()"
        :disabled="button.disabled"
        :class="button.isActive() ? 'bg-accent text-accent-foreground' : ''"
        @click="button.action()"
      >
        <Icon :name="button.icon" />
      </Button>
      <Skeleton v-if="uploading" class="ml-2 h-4 w-20" />
    </div>

    <div class="p-4">
      <EditorContent :editor="editor" />
    </div>

    <input
      ref="fileInput"
      type="file"
      class="sr-only"
      accept="image/png,image/jpeg,image/webp,image/avif"
      @change="uploadImage"
    >
  </div>
</template>

<style>
/* Scoped to the editor's own content class so article prose styles in
   ArticleBody.vue stay independent. */
.tiptap-content > * + * {
  margin-top: 0.75rem;
}
.tiptap-content h2 {
  font-size: 1.375rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-top: 1.75rem;
}
.tiptap-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 1.5rem;
}
.tiptap-content ul {
  list-style: disc;
  padding-left: 1.25rem;
}
.tiptap-content ol {
  list-style: decimal;
  padding-left: 1.25rem;
}
.tiptap-content blockquote {
  border-left: 2px solid var(--border);
  padding-left: 0.875rem;
  color: var(--muted-foreground);
}
.tiptap-content pre {
  background: var(--muted);
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.875rem;
}
.tiptap-content code {
  font-family: var(--font-mono);
  font-size: 0.875em;
}
.tiptap-content a {
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 4px;
}
.tiptap-content img {
  border-radius: var(--radius);
  max-width: 100%;
  height: auto;
}
.tiptap-content p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--muted-foreground);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
