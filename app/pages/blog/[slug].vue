<script setup lang="ts">
import { formatDate, readingMinutes } from '#shared/utils/format'

const route = useRoute()
const config = useRuntimeConfig()
const slug = computed(() => String(route.params.slug))

const { data: post } = await useArticle(slug.value)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
}

useSeo({
  title: post.value.meta_title || post.value.title,
  description: post.value.meta_description || post.value.excerpt || undefined,
  image: post.value.thumbnail_url,
  type: 'article',
})

const minutes = computed(() => readingMinutes(post.value?.content))

const shareUrl = computed(
  () => `${String(config.public.siteUrl).replace(/\/$/, '')}/blog/${slug.value}`,
)

const { trackEvent } = useTrackEvent()
onMounted(() => trackEvent('blog_view', { slug: slug.value }))

// Reading progress, so a long article shows how much is left. One passive
// listener on a page whose only other motion is the copy confirmation.
const progress = ref(0)
function onScroll() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight
  progress.value = scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0
}
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const { data: related } = await useArticles({
  limit: 3,
  category: () => post.value?.blog_categories?.slug ?? null,
})
const otherArticles = computed(() =>
  (related.value?.items ?? []).filter((item) => item.slug !== post.value?.slug).slice(0, 3),
)
</script>

<template>
  <article v-if="post" class="page-shell py-16 md:py-20">
    <div
      class="bg-primary fixed top-16 left-0 z-40 h-px"
      :style="{ width: `${progress}%` }"
      aria-hidden="true"
    />

    <!-- One measured column: the body is 45rem wide and the meta rail takes the
         rest, so the article never stretches to the full page width. -->
    <div class="mx-auto flex w-full max-w-5xl flex-col">
      <NuxtLink
        to="/blog"
        class="text-caption text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 self-start font-mono transition-colors duration-200"
      >
        <Icon name="ph:arrow-left" class="size-3.5" />
        All articles
      </NuxtLink>

      <header class="border-border/70 mt-8 border-b pb-10">
        <div class="flex max-w-3xl flex-col gap-4">
          <NuxtLink
            v-if="post.blog_categories"
            :to="`/blog?category=${post.blog_categories.slug}`"
            class="text-caption text-primary self-start font-mono tracking-widest uppercase transition-opacity duration-200 hover:opacity-80"
          >
            {{ post.blog_categories.name }}
          </NuxtLink>

          <h1 class="text-display">{{ post.title }}</h1>
          <p v-if="post.excerpt" class="text-body text-muted-foreground text-lg">{{ post.excerpt }}</p>
        </div>

        <p class="text-caption text-muted-foreground mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
          <span>{{ formatDate(post.published_at) }}</span>
          <span aria-hidden="true">·</span>
          <span>{{ minutes }} min read</span>
        </p>
      </header>

      <img
        v-if="post.thumbnail_url"
        :src="post.thumbnail_url"
        alt=""
        width="1200"
        height="630"
        class="border-border mt-10 aspect-[16/9] w-full rounded-xl border object-cover"
      >

      <div class="mt-14 grid gap-12 lg:grid-cols-[minmax(0,45rem)_minmax(0,1fr)] lg:gap-16">
        <ArticleBody :content="post.content" />

        <!-- Meta rail: sticky on wide screens, folded into the flow on narrow. -->
        <aside class="border-border/70 flex flex-wrap gap-x-10 gap-y-6 border-t pt-8 lg:sticky lg:top-24 lg:flex-col lg:gap-6 lg:self-start lg:border-t-0 lg:pt-0">
          <div class="flex flex-col gap-1">
            <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">
              Published
            </p>
            <p class="text-caption font-mono">{{ formatDate(post.published_at) }}</p>
          </div>

          <div class="flex flex-col gap-1">
            <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">
              Reading time
            </p>
            <p class="text-caption font-mono">{{ minutes }} min</p>
          </div>

          <div class="flex items-center gap-2">
            <CopyButton :value="shareUrl" label="Copy a link to this article" />
            <span class="text-caption text-muted-foreground font-mono">Copy link</span>
          </div>
        </aside>
      </div>

      <section v-if="otherArticles.length" class="border-border/70 mt-20 border-t pt-10">
        <h2 class="text-subtitle">More from the blog</h2>
        <div class="mt-8 grid gap-10 md:grid-cols-2">
          <ArticleCard v-for="item in otherArticles" :key="item.id" :post="item" />
        </div>
      </section>
    </div>
  </article>
</template>
