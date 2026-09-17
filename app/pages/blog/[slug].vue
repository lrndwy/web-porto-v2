<script setup lang="ts">
import { formatDate } from '#shared/utils/format'
const route = useRoute()
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

const { trackEvent } = useTrackEvent()
const { data: related } = await useArticles(3, 1, post.value.blog_categories?.slug)
const otherArticles = computed(() =>
  (related.value?.items ?? []).filter((item) => item.slug !== post.value?.slug).slice(0, 3),
)
</script>

<template>
  <article v-if="post" class="mx-auto w-full max-w-[1400px] px-6 py-16 md:py-20">
    <header class="flex flex-col gap-3">
      <NuxtLink
        v-if="post.blog_categories"
        :to="`/blog?category=${post.blog_categories.slug}`"
        class="text-caption text-muted-foreground hover:text-foreground font-mono tracking-widest uppercase transition-colors duration-200"
      >
        {{ post.blog_categories.name }}
      </NuxtLink>

      <h1 class="text-title measure-prose">{{ post.title }}</h1>
      <p v-if="post.excerpt" class="text-body text-muted-foreground measure-prose">{{ post.excerpt }}</p>
      <p class="text-caption text-muted-foreground font-mono">{{ formatDate(post.published_at) }}</p>
    </header>

    <img
      v-if="post.thumbnail_url"
      :src="post.thumbnail_url"
      alt=""
      width="1200"
      height="630"
      class="border-border mt-8 w-full max-w-3xl rounded-lg border object-cover"
    >

    <div class="mt-10" @click="trackEvent('blog_view', { slug: post.slug })">
      <ArticleBody :content="post.content" />
    </div>

    <section v-if="otherArticles.length" class="border-border mt-16 border-t pt-10">
      <h2 class="text-subtitle">Related articles</h2>
      <div class="mt-6 grid gap-8 md:grid-cols-2">
        <ArticleCard v-for="item in otherArticles" :key="item.id" :post="item" />
      </div>
    </section>
  </article>
</template>
