<script setup lang="ts">
const props = defineProps<{ project: GithubRepositoryRow }>()

const { trackEvent } = useTrackEvent()

const meta = computed(() =>
  [props.project.language, `${props.project.stars} stars`, `${props.project.forks} forks`]
    .filter(Boolean)
    .join(' · '),
)
</script>

<template>
  <article
    class="bg-card shadow-surface hover:border-primary/40 flex flex-col gap-5 rounded-lg border p-6 transition-colors duration-200 md:flex-row md:items-center md:gap-8 md:p-8"
  >
    <div class="flex flex-1 flex-col gap-3">
      <p class="text-caption text-primary font-mono tracking-widest uppercase">Featured</p>
      <h3 class="text-title">{{ props.project.name }}</h3>
      <p v-if="props.project.description" class="text-body text-muted-foreground measure">
        {{ props.project.description }}
      </p>
      <p class="text-caption text-muted-foreground font-mono">{{ meta }}</p>

      <div class="flex flex-wrap items-center gap-4 pt-1">
        <Button as-child size="sm" variant="outline" class="active:translate-y-px">
          <a
            :href="props.project.html_url"
            target="_blank"
            rel="noopener noreferrer"
            @click="trackEvent('github_click', { repo: props.project.full_name })"
          >
            <Icon name="ph:github-logo" />
            GitHub
          </a>
        </Button>
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
      </div>
    </div>

    <!-- Token-coloured composition: no external image dependency. -->
    <div
      class="border-border bg-muted/60 relative h-40 w-full shrink-0 overflow-hidden rounded-md border md:h-44 md:w-64"
      aria-hidden="true"
    >
      <div class="bg-chart-1/25 absolute inset-x-6 top-6 h-16 rounded-md" />
      <div class="bg-chart-2/25 absolute inset-x-12 top-16 h-16 rounded-md" />
      <div class="bg-chart-3/25 absolute inset-x-3 bottom-5 h-10 rounded-md" />
      <div class="border-border absolute inset-3 rounded-md border border-dashed" />
    </div>
  </article>
</template>
