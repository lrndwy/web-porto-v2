<script setup lang="ts">
import { toast } from 'vue-sonner'

const props = defineProps<{ id?: string }>()

interface Taxonomy {
  categories: { id: string; name: string; slug: string; post_count: number }[]
  tags: { id: string; name: string; slug: string; post_count: number }[]
}

interface BlogPostRow {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: unknown
  thumbnail_url: string | null
  category_id: string | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  meta_title: string | null
  meta_description: string | null
  blog_post_tags?: { tag_id: string }[]
}

const RichTextEditor = defineAsyncComponent(() => import('~/components/admin/RichTextEditor.vue'))

const router = useRouter()

const { data: taxonomy, refresh: refreshTaxonomy } = await useAsyncData('blog-taxonomy', () =>
  $fetch<Taxonomy>('/api/admin/blog/taxonomy'),
)

const loading = ref(!!props.id)
const saving = ref<'draft' | 'publish' | null>(null)

const title = ref('')
const excerpt = ref('')
const content = ref<unknown>(null)
const thumbnailUrl = ref<string | null>(null)
const categoryId = ref<string | null>(null)
const status = ref<'draft' | 'published' | 'archived'>('draft')
const metaTitle = ref('')
const metaDescription = ref('')
const selectedTagIds = ref<string[]>([])
const slug = ref('')
const publishedAt = ref<string | null>(null)

onMounted(async () => {
  if (!props.id) {
    loading.value = false
    return
  }
  try {
    const post = await $fetch<BlogPostRow>(`/api/admin/blog/posts/${props.id}`)
    title.value = post.title
    slug.value = post.slug
    excerpt.value = post.excerpt ?? ''
    content.value = post.content
    thumbnailUrl.value = post.thumbnail_url
    categoryId.value = post.category_id
    status.value = post.status
    publishedAt.value = post.published_at
    metaTitle.value = post.meta_title ?? ''
    metaDescription.value = post.meta_description ?? ''
    selectedTagIds.value = (post.blog_post_tags ?? []).map((link) => link.tag_id)
  } catch (error) {
    toast.error(errorMessage(error, 'Could not load this article.'))
  } finally {
    loading.value = false
  }
})

useHead({ title: props.id ? 'Edit article' : 'New article' })

function toggleTag(tagId: string, checked: boolean) {
  selectedTagIds.value = checked
    ? [...selectedTagIds.value, tagId]
    : selectedTagIds.value.filter((id) => id !== tagId)
}

const newTagName = ref('')
async function createTag() {
  const name = newTagName.value.trim()
  if (!name) return
  try {
    await $fetch('/api/admin/blog/taxonomy', {
      method: 'POST',
      body: { kind: 'tag', name },
    })
    newTagName.value = ''
    await refreshTaxonomy()
  } catch (error) {
    toast.error(errorMessage(error, 'Could not create the tag.'))
  }
}

const unpublishOpen = ref(false)

async function save(nextStatus: 'draft' | 'published' | 'archived') {
  if (!title.value.trim()) {
    toast.error('A title is required.')
    return
  }
  if (nextStatus === 'published' && !excerpt.value.trim()) {
    toast.error('An excerpt is required before publishing.')
    return
  }

  saving.value = nextStatus === 'published' ? 'publish' : 'draft'
  try {
    const body = {
      title: title.value.trim(),
      excerpt: excerpt.value.trim() || null,
      content: content.value,
      thumbnail_url: thumbnailUrl.value,
      category_id: categoryId.value,
      status: nextStatus,
      published_at: publishedAt.value,
      meta_title: metaTitle.value.trim() || null,
      meta_description: metaDescription.value.trim() || null,
      tag_ids: selectedTagIds.value,
    }

    if (props.id) {
      const updated = await $fetch<BlogPostRow>(`/api/admin/blog/posts/${props.id}`, {
        method: 'PATCH',
        body,
      })
      publishedAt.value = updated.published_at
      status.value = updated.status
      slug.value = updated.slug
    } else {
      const created = await $fetch<BlogPostRow>('/api/admin/blog/posts', { method: 'POST', body })
      toast.success('Article created.')
      await router.push(`/admin/blog/${created.id}`)
      return
    }

    toast.success(nextStatus === 'published' ? 'Article published.' : 'Draft saved.')
  } catch (error) {
    toast.error(errorMessage(error, 'Could not save the article.'))
  } finally {
    saving.value = null
  }
}
</script>

<template>
  <div v-if="loading" class="flex flex-col gap-4">
    <Skeleton class="h-8 w-64" />
    <Skeleton class="h-96 w-full" />
  </div>

  <div v-else class="flex flex-col gap-6">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-col gap-1">
        <h2 class="text-title">{{ props.id ? 'Edit article' : 'New article' }}</h2>
        <p v-if="slug" class="text-caption text-muted-foreground font-mono">/blog/{{ slug }}</p>
      </div>
      <Badge :variant="status === 'published' ? 'default' : 'outline'" class="capitalize">
        {{ status }}
      </Badge>
    </header>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div class="flex min-w-0 flex-col gap-4">
        <Input v-model="title" placeholder="Article title" aria-label="Article title" class="text-subtitle h-11" />
        <Textarea v-model="excerpt" :rows="2" placeholder="One-sentence summary, used in lists and search results." aria-label="Excerpt" />
        <RichTextEditor v-model="content" />
      </div>

      <aside class="flex flex-col gap-6">
        <Field>
          <FieldLabel for="post-category">Category</FieldLabel>
          <Select :model-value="categoryId ?? ''" @update:model-value="categoryId = String($event) || null">
            <SelectTrigger id="post-category" class="w-full">
              <SelectValue placeholder="No category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="category in taxonomy?.categories ?? []"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Tags</FieldLabel>
          <div class="flex flex-col gap-2">
            <label
              v-for="tag in taxonomy?.tags ?? []"
              :key="tag.id"
              class="flex items-center gap-2"
            >
              <Checkbox
                :model-value="selectedTagIds.includes(tag.id)"
                @update:model-value="toggleTag(tag.id, $event === true)"
              />
              <span class="text-caption">{{ tag.name }}</span>
            </label>
            <div class="flex items-center gap-2">
              <Input v-model="newTagName" placeholder="New tag" class="h-8" aria-label="New tag name" />
              <Button type="button" size="sm" variant="outline" @click="createTag">Add</Button>
            </div>
          </div>
        </Field>

        <Field>
          <FieldLabel>Thumbnail</FieldLabel>
          <ImageUploadField v-model="thumbnailUrl" bucket="blog-images" />
        </Field>

        <Field>
          <FieldLabel for="meta-title">SEO title</FieldLabel>
          <Input id="meta-title" v-model="metaTitle" placeholder="Defaults to the article title" />
        </Field>

        <Field>
          <FieldLabel for="meta-description">SEO description</FieldLabel>
          <Textarea id="meta-description" v-model="metaDescription" :rows="3" />
        </Field>
      </aside>
    </div>

    <div class="bg-background/95 sticky bottom-0 flex flex-wrap items-center gap-2 border-t py-3 backdrop-blur">
      <Button variant="ghost" :disabled="!!saving" @click="save('draft')">
        {{ saving === 'draft' ? 'Saving…' : 'Save draft' }}
      </Button>
      <Button class="active:translate-y-px" :disabled="!!saving" @click="save('published')">
        {{ saving === 'publish' ? 'Publishing…' : 'Publish' }}
      </Button>
      <Button
        v-if="status === 'published'"
        variant="outline"
        :disabled="!!saving"
        @click="unpublishOpen = true"
      >
        Unpublish
      </Button>
      <Button as-child variant="ghost" class="ml-auto">
        <NuxtLink to="/admin/blog">Back to list</NuxtLink>
      </Button>
    </div>

    <AlertDialog :open="unpublishOpen" @update:open="(open) => (unpublishOpen = open)">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unpublish this article?</AlertDialogTitle>
          <AlertDialogDescription>
            It disappears from the public blog immediately and becomes a draft.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            @click="
              () => {
                unpublishOpen = false
                save('draft')
              }
            "
          >
            Unpublish
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
