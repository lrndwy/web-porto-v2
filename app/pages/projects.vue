<script setup lang="ts">
const { data: projects } = await useFeaturedProjects()
const { trackEvent } = useTrackEvent()

useSeo({ title: 'Projects' })

const activeLanguage = ref<string | null>(null)
const featuredOnly = ref(false)

const languages = computed(() =>
  [...new Set((projects.value ?? []).map((project) => project.language).filter(Boolean))].sort() as string[],
)

const filtered = computed(() =>
  (projects.value ?? []).filter(
    (project) =>
      (!activeLanguage.value || project.language === activeLanguage.value) &&
      (!featuredOnly.value || project.is_featured),
  ),
)

const featured = computed(() => filtered.value.find((project) => project.is_featured) ?? null)
const rest = computed(() => filtered.value.filter((project) => project.id !== featured.value?.id))
</script>

<template>
  <SectionShell id="projects">
    <SectionHeading
      overline="Work"
      title="Projects"
      description="Repositories synced from GitHub, curated by the owner."
    />

    <div v-if="projects?.length" class="mt-8 flex flex-wrap items-center gap-2">
      <Button shape="pill"
        size="sm"
        :variant="activeLanguage === null ? 'default' : 'outline'"
        :aria-pressed="activeLanguage === null"
        @click="activeLanguage = null"
      >
        All languages
      </Button>
      <Button shape="pill"
        v-for="language in languages"
        :key="language"
        size="sm"
        :variant="activeLanguage === language ? 'default' : 'outline'"
        :aria-pressed="activeLanguage === language"
        @click="activeLanguage = language"
      >
        {{ language }}
      </Button>
      <Button shape="pill"
        size="sm"
        :variant="featuredOnly ? 'default' : 'outline'"
        :aria-pressed="featuredOnly"
        @click="featuredOnly = !featuredOnly"
      >
        Featured
      </Button>
    </div>

    <div v-if="filtered.length" class="mt-10 flex flex-col gap-6">
      <RevealOnScroll v-if="featured">
        <FeaturedProject :project="featured" />
      </RevealOnScroll>

      <div class="grid gap-6 md:grid-cols-2">
        <RevealOnScroll v-for="(project, index) in rest" :key="project.id" :delay="index * 0.05">
          <ProjectCard :project="project" @click="trackEvent('project_view', { repo: project.full_name })" />
        </RevealOnScroll>
      </div>
    </div>

    <div v-else class="mt-10">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><Icon name="ph:folders" /></EmptyMedia>
          <EmptyTitle>No projects to show.</EmptyTitle>
          <EmptyDescription>
            <template v-if="projects?.length">
              No repository matches the current filter.
            </template>
            <template v-else>
              Projects appear here after a GitHub sync is run from the dashboard.
            </template>
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent v-if="!projects?.length">
          <Button shape="pill" as-child variant="outline" class="active:translate-y-px">
            <NuxtLink to="/contact">Get in touch</NuxtLink>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  </SectionShell>
</template>
