<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

const props = defineProps<{ content: unknown }>()

// The body is rendered by the same TipTap schema that produced it, so no
// separate JSON-to-Vue renderer is needed.
const editor = useEditor({
  editable: false,
  content: (props.content as object | null) ?? undefined,
  extensions: [StarterKit, Link.configure({ openOnClick: false }), Image],
})

onBeforeUnmount(() => editor.value?.destroy())
</script>

<template>
  <ClientOnly>
    <div class="measure-prose article-body">
      <EditorContent :editor="editor" />
    </div>

    <template #fallback>
      <div class="measure-prose flex flex-col gap-3" aria-hidden="true">
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-11/12" />
        <Skeleton class="h-4 w-4/5" />
        <Skeleton class="h-4 w-full" />
      </div>
    </template>
  </ClientOnly>
</template>

<style scoped>
.article-body :deep(.tiptap),
.article-body :deep(.ProseMirror) {
  outline: none;
}

.article-body :deep(.ProseMirror) {
  font-size: 1rem;
  line-height: 1.75;
}

.article-body :deep(.ProseMirror > * + *) {
  margin-top: 0.9rem;
}

.article-body :deep(h2) {
  font-size: 1.5rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
  font-weight: 600;
  margin-top: 2.25rem;
}

.article-body :deep(h3) {
  font-size: 1.1875rem;
  font-weight: 600;
  margin-top: 1.75rem;
}

.article-body :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
}

.article-body :deep(ol) {
  list-style: decimal;
  padding-left: 1.25rem;
}

.article-body :deep(li + li) {
  margin-top: 0.35rem;
}

.article-body :deep(blockquote) {
  border-left: 2px solid var(--border);
  padding-left: 1rem;
  color: var(--muted-foreground);
}

/* Code blocks scroll horizontally rather than widening the measure. */
.article-body :deep(pre) {
  background: var(--muted);
  border-radius: var(--radius);
  padding: 1rem 1.125rem;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.6;
}

.article-body :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.875em;
}

.article-body :deep(a) {
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.article-body :deep(img) {
  border-radius: var(--radius);
  border: 1px solid var(--border);
  max-width: 100%;
  height: auto;
}

.article-body :deep(hr) {
  border-color: var(--border);
  margin: 2rem 0;
}
</style>
