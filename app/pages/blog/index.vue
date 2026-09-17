<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

const PAGE_SIZE = 9

const route = useRoute()
const router = useRouter()

const { data: categories } = await useBlogCategories()

const activeCategory = ref<string | null>(
  typeof route.query.category === 'string' ? route.query.category : null,
)
const searchInput = ref(typeof route.query.q === 'string' ? route.query.q : '')
const search = ref(searchInput.value)
const page = ref(1)

// Debounced so a fast typist does not fire a query per keystroke.
watch(searchInput, useDebounceFn((value: string) => {
  search.value = value.trim()
  page.value = 1
}, 300))

const { data: articles, pending } = await useArticles({
  limit: PAGE_SIZE,
  page: () => page.value,
  category: () => activeCategory.value,
  search: () => search.value,
})

useSeo({ title: 'Blog' })

watch(activeCategory, (value) => {
  page.value = 1
  router.replace({ query: { ...route.query, category: value ?? undefined } })
})

const items = computed(() => articles.value?.items ?? [])
const total = computed(() => articles.value?.total ?? 0)
const hasMore = computed(() => page.value * PAGE_SIZE < total.value)
const isFiltered = computed(() => !!search.value || !!activeCategory.value)
</script>

<template>
  <SectionShell id="blog">
    <SectionHeading
      overline="Writing"
      title="Blog"
      description="Notes on engineering, systems, and the craft of building software."
    />

    <div class="mt-8 flex flex-col gap-4">
      <!-- Search -->
      <div class="relative w-full max-w-md">
        <Icon
          name="ph:magnifying-glass"
          class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <Input
          v-model="searchInput"
          type="search"
          placeholder="Search articles…"
          aria-label="Search articles"
          class="pl-9"
        />
        <Button
          v-if="searchInput"
          variant="ghost"
          size="icon-xs"
          aria-label="Clear search"
          class="absolute top-1/2 right-2 -translate-y-1/2"
          @click="searchInput = ''"
        >
          <Icon name="ph:x" />
        </Button>
      </div>

      <!-- Categories -->
      <div v-if="categories?.length" class="flex flex-wrap items-center gap-2">
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

      <p v-if="isFiltered && !pending" class="text-caption text-muted-foreground font-mono">
        {{ total }} {{ total === 1 ? 'article' : 'articles' }}
        <template v-if="search">matching “{{ search }}”</template>
      </p>
    </div>

    <div v-if="pending && !items.length" class="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2">
      <div v-for="index in 4" :key="index" class="flex flex-col gap-3">
        <Skeleton class="h-5 w-24" />
        <Skeleton class="h-6 w-full" />
        <Skeleton class="h-4 w-5/6" />
      </div>
    </div>

    <div v-else-if="items.length" class="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2">
      <RevealOnScroll v-for="(post, index) in items" :key="post.id" :delay="index * 0.04">
        <ArticleCard :post="post as unknown as ArticleSummary" />
      </RevealOnScroll>
    </div>

    <div v-else class="mt-10">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon :name="isFiltered ? 'ph:magnifying-glass' : 'ph:article'" />
          </EmptyMedia>
          <EmptyTitle>
            {{ isFiltered ? 'No articles match.' : 'Nothing published yet.' }}
          </EmptyTitle>
          <EmptyDescription>
            <template v-if="isFiltered">
              Try a different search term, or clear the filters to see everything.
            </template>
            <template v-else>
              Articles appear here once the owner publishes them.
            </template>
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent v-if="isFiltered">
          <Button
            variant="outline"
            class="active:translate-y-px"
            @click="
              () => {
                searchInput = ''
                activeCategory = null
              }
            "
          >
            Clear filters
          </Button>
        </EmptyContent>
      </Empty>
    </div>

    <div v-if="hasMore" class="mt-12 flex justify-center">
      <Button variant="outline" class="active:translate-y-px" :disabled="pending" @click="page += 1">
        {{ pending ? 'Loading…' : 'Load more' }}
      </Button>
    </div>
  </SectionShell>
</template>
