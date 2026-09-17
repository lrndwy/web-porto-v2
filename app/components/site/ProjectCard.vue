<script setup lang="ts">
import { formatDate } from '#shared/utils/format'
const props = defineProps<{ project: GithubRepositoryRow }>()

const { trackEvent } = useTrackEvent()

const meta = computed(() =>
  [
    props.project.language,
    `${props.project.stars} stars`,
    `${props.project.forks} forks`,
  ]
    .filter(Boolean)
    .join(' · '),
)
</script>

<template>
  <article
    class="bg-card shadow-surface hover:border-primary/40 flex h-full flex-col gap-3 rounded-lg border p-5 transition-colors duration-200"
  >
    <div class="flex items-start justify-between gap-3">
      <h3 class="text-subtitle">{{ props.project.name }}</h3>
      <span v-if="props.project.is_featured" class="text-caption text-primary font-mono shrink-0">
        Featured
      </span>
    </div>

    <p v-if="props.project.description" class="text-body text-muted-foreground">
      {{ props.project.description }}
    </p>

    <p class="text-caption text-muted-foreground font-mono">{{ meta }}</p>

    <div class="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
      <a
        :href="props.project.html_url"
        target="_blank"
        rel="noopener noreferrer"
        class="text-caption text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors duration-200"
        @click="trackEvent('github_click', { repo: props.project.full_name })"
      >
        <Icon name="ph:github-logo" class="size-4" />
        GitHub
      </a>
      <a
        v-if="props.project.homepage_url"
        :href="props.project.homepage_url"
        target="_blank"
        rel="noopener noreferrer"
        class="text-caption text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors duration-200"
      >
        <Icon name="ph:arrow-up-right" class="size-4" />
        Live Demo
      </a>
      <span v-if="props.project.pushed_at" class="text-caption text-muted-foreground ml-auto font-mono">
        {{ formatDate(props.project.pushed_at) }}
      </span>
    </div>
  </article>
</template>
