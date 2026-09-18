<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import {
  blogCategoryBlank,
  blogCategoryFields,
  blogTagBlank,
  blogTagFields,
} from '~/lib/resource-forms'
import { blogCategorySchema, blogTagSchema } from '#shared/schemas/resources'

definePageMeta({ layout: 'admin', title: 'Blog taxonomy' })

const categoryColumns: ColumnDef[] = [
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug', mono: true },
  { key: 'description', label: 'Description', secondary: true },
]

const tagColumns: ColumnDef[] = [
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug', mono: true },
]

const { create: createCategory, update: updateCategory } = useResource('blog-categories')
const { create: createTag, update: updateTag } = useResource('blog-tags')

const categoryDialogOpen = ref(false)
const editingCategory = ref<Record<string, unknown> | null>(null)
const categorySaving = ref(false)
const categoryForm = useForm({
  validationSchema: toTypedSchema(blogCategorySchema),
  initialValues: { ...blogCategoryBlank },
})

function openCategoryCreate() {
  editingCategory.value = null
  categoryForm.resetForm({ values: { ...blogCategoryBlank } })
  categoryDialogOpen.value = true
}

function openCategoryEdit(row: Record<string, unknown>) {
  editingCategory.value = row
  categoryForm.resetForm({ values: { ...blogCategoryBlank, ...row } })
  categoryDialogOpen.value = true
}

const submitCategory = categoryForm.handleSubmit(async (values) => {
  categorySaving.value = true
  const target = editingCategory.value
  const result = target ? await updateCategory(String(target.id), values) : await createCategory(values)
  categorySaving.value = false
  if (result) categoryDialogOpen.value = false
})

const tagDialogOpen = ref(false)
const editingTag = ref<Record<string, unknown> | null>(null)
const tagSaving = ref(false)
const tagForm = useForm({
  validationSchema: toTypedSchema(blogTagSchema),
  initialValues: { ...blogTagBlank },
})

function openTagCreate() {
  editingTag.value = null
  tagForm.resetForm({ values: { ...blogTagBlank } })
  tagDialogOpen.value = true
}

function openTagEdit(row: Record<string, unknown>) {
  editingTag.value = row
  tagForm.resetForm({ values: { ...blogTagBlank, ...row } })
  tagDialogOpen.value = true
}

const submitTag = tagForm.handleSubmit(async (values) => {
  tagSaving.value = true
  const target = editingTag.value
  const result = target ? await updateTag(String(target.id), values) : await createTag(values)
  tagSaving.value = false
  if (result) tagDialogOpen.value = false
})
</script>

<template>
  <div class="flex flex-col gap-10">
    <header class="flex flex-col gap-1">
      <h2 class="text-title">Blog taxonomy</h2>
      <p class="text-caption text-muted-foreground">
        Categories and tags used to organise articles. Slugs are generated from the name.
      </p>
      <Button as-child variant="ghost" size="sm" class="mt-2 w-fit">
        <NuxtLink to="/admin/blog">
          <Icon name="ph:arrow-left" />
          Back to articles
        </NuxtLink>
      </Button>
    </header>

    <ResourceListPage
      resource="blog-categories"
      title="Categories"
      description="An article belongs to at most one category."
      :columns="categoryColumns"
      add-label="Add category"
      empty-title="No categories yet."
      empty-body="Create a category to group related articles."
      @create="openCategoryCreate"
      @edit="openCategoryEdit"
    >
      <template #dialogs>
        <Dialog v-model:open="categoryDialogOpen">
          <DialogContent class="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{{ editingCategory ? 'Edit category' : 'Add category' }}</DialogTitle>
            </DialogHeader>

            <form novalidate @submit="submitCategory">
              <div class="grid gap-5 py-2">
                <ResourceField v-for="field in blogCategoryFields" :key="field.name" :field="field" />
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" :disabled="categorySaving" @click="categoryDialogOpen = false">
                  Cancel
                </Button>
                <Button type="submit" class="active:translate-y-px" :disabled="categorySaving">
                  {{ categorySaving ? 'Saving…' : 'Save' }}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </template>
    </ResourceListPage>

    <ResourceListPage
      resource="blog-tags"
      title="Tags"
      description="An article can carry several tags."
      :columns="tagColumns"
      add-label="Add tag"
      empty-title="No tags yet."
      empty-body="Create tags to label articles across categories."
      @create="openTagCreate"
      @edit="openTagEdit"
    >
      <template #dialogs>
        <Dialog v-model:open="tagDialogOpen">
          <DialogContent class="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{{ editingTag ? 'Edit tag' : 'Add tag' }}</DialogTitle>
            </DialogHeader>

            <form novalidate @submit="submitTag">
              <div class="grid gap-5 py-2">
                <ResourceField v-for="field in blogTagFields" :key="field.name" :field="field" />
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" :disabled="tagSaving" @click="tagDialogOpen = false">
                  Cancel
                </Button>
                <Button type="submit" class="active:translate-y-px" :disabled="tagSaving">
                  {{ tagSaving ? 'Saving…' : 'Save' }}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </template>
    </ResourceListPage>
  </div>
</template>
