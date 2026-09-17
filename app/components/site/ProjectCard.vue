<script setup lang="ts">
const props = defineProps<{ project: GithubRepositoryRow }>()

const { trackEvent } = useTrackEvent()

const meta = computed<string[]>(() =>
  [
    props.project.language,
    `${formatNumber(props.project.stars)} stars`,
    `${formatNumber(props.project.forks)} forks`,
  ].filter((entry): entry is string => !!entry),
)

/** The card's only decorative move: a corner wash that fades in on hover. */
const wash = {
  background: 'radial-gradient(closest-side, var(--primary), transparent 70%)',
}

const pushedLabel = computed(() =>
  props.project.pushed_at ? formatDate(props.project.pushed_at) : null,
)
</script>

<template>
  <!-- Double bezel: hairline shell, inner core with concentric radii. -->
  <article
    class="group border-border/70 bg-muted/25 shadow-surface hover:border-primary/40 flex h-full rounded-2xl border p-1.5 transition-colors duration-300"
  >
    <div
      class="border-border/60 bg-card relative flex h-full w-full flex-col gap-4 overflow-hidden rounded-[calc(1rem-0.375rem)] border p-5"
    >
      <div
        class="pointer-events-none absolute -top-20 -right-14 size-44 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-[0.08]"
        :style="wash"
        aria-hidden="true"
      />

      <div class="relative flex items-start justify-between gap-3">
        <h3 class="text-subtitle group-hover:text-primary transition-colors duration-200">
          {{ props.project.name }}
        </h3>
        <span
          v-if="props.project.is_featured"
          class="border-primary/30 text-primary shrink-0 rounded-full border px-2 py-0.5 text-caption font-mono"
        >
          Featured
        </span>
      </div>

      <p v-if="props.project.description" class="text-body text-muted-foreground relative line-clamp-3">
        {{ props.project.description }}
      </p>

      <!-- Meta reads as one line of data, not a row of badges. -->
      <dl
        class="border-border/60 text-caption text-muted-foreground relative mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-3 font-mono"
      >
        <template v-for="(entry, index) in meta" :key="entry">
          <span v-if="index > 0" aria-hidden="true">·</span>
          <dd>{{ entry }}</dd>
        </template>
        <dd v-if="pushedLabel" class="ml-auto">{{ pushedLabel }}</dd>
      </dl>

      <div class="relative flex flex-wrap items-center gap-x-4 gap-y-2">
        <a
          :href="props.project.html_url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-caption text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors duration-200"
          @click="trackEvent('github_click', { repo: props.project.full_name })"
        >
          <Icon name="ph:github-logo" class="size-4" />
          GitHub
          <Icon name="ph:arrow-up-right" class="size-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
        <a
          v-if="props.project.homepage_url"
          :href="props.project.homepage_url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-caption text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors duration-200"
        >
          <Icon name="ph:browser" class="size-4" />
          Live Demo
        </a>
      </div>
    </div>
  </article>
</template>
