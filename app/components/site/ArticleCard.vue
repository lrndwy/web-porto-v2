<script setup lang="ts">
import { formatDate } from '#shared/utils/format'
const props = defineProps<{ post: ArticleSummary }>()

const { trackEvent } = useTrackEvent()
</script>

<template>
  <article class="group flex flex-col">
    <NuxtLink
      :to="`/blog/${props.post.slug}`"
      class="flex flex-col gap-3"
      @click="trackEvent('blog_view', { slug: props.post.slug })"
    >
      <div
        v-if="props.post.thumbnail_url"
        class="border-border aspect-[16/9] w-full overflow-hidden rounded-md border"
      >
        <img
          :src="props.post.thumbnail_url"
          alt=""
          width="640"
          height="360"
          loading="lazy"
          class="size-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        >
      </div>

      <p v-if="props.post.blog_categories" class="text-caption text-muted-foreground font-mono">
        {{ props.post.blog_categories.name }}
      </p>

      <h3
        class="text-subtitle group-hover:text-primary transition-colors duration-200"
      >
        {{ props.post.title }}
      </h3>

      <p v-if="props.post.excerpt" class="text-body text-muted-foreground">{{ props.post.excerpt }}</p>

      <p class="text-caption text-muted-foreground font-mono">
        {{ formatDate(props.post.published_at) }}
      </p>
    </NuxtLink>
  </article>
</template>
