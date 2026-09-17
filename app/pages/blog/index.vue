<script setup lang="ts">
import { formatDate } from '#shared/utils/format'

const PAGE_SIZE = 9

const route = useRoute()
const router = useRouter()

const { data: categories } = await useBlogCategories()

const activeCategory = ref<string | null>(
  typeof route.query.category === 'string' ? route.query.category : null,
)
const page = ref(1)

const { data: articles } = await useArticles(PAGE_SIZE, page.value, activeCategory.value ?? undefined)

useSeo({ title: 'Blog' })

watch(activeCategory, (value) => {
  page.value = 1
  router.replace({ query: value ? { category: value } : {} })
})

const items = computed(() => articles.value?.items ?? [])
const total = computed(() => articles.value?.total ?? 0)
const hasMore = computed(() => page.value * PAGE_SIZE < total.value)
</script>

<template>
  <SectionShell id="blog">
    <SectionHeading
      overline="Writing"
      title="Blog"
      description="Notes on engineering, systems, and the craft of building software."
    />

    <div v-if="categories?.length" class="mt-8 flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        :variant="activeCategory === null ? 'default' : 'outline'"
        :aria-pressed="activeCategory === null"
        @click="activeCategory = null"
      >
        All
      </Button>
      <Button
        v-for="category in categories"
        :key="category.id"
        size="sm"
        :variant="activeCategory === category.slug ? 'default' : 'outline'"
        :aria-pressed="activeCategory === category.slug"
        @click="activeCategory = category.slug"
      >
        {{ category.name }}
      </Button>
    </div>

    <div v-if="items.length" class="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2">
      <RevealOnScroll v-for="(post, index) in items" :key="post.id" :delay="index * 0.04">
        <div class="flex flex-col gap-2">
          <ArticleCard :post="post as unknown as ArticleSummary" />
          <p class="text-caption text-muted-foreground font-mono">
            {{ formatDate(post.published_at) }}
          </p>
        </div>
      </RevealOnScroll>
    </div>

    <div v-else class="mt-10">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><Icon name="ph:article" /></EmptyMedia>
          <EmptyTitle>Nothing published yet.</EmptyTitle>
          <EmptyDescription>
            Articles appear here once the owner publishes them.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>

    <div v-if="hasMore" class="mt-12 flex justify-center">
      <Button variant="outline" class="active:translate-y-px" @click="page += 1">
        Load more
      </Button>
    </div>
  </SectionShell>
</template>
