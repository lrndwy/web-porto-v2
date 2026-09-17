<script setup lang="ts">
const { data: profile } = await useProfile()
const { data: experiences } = await useExperiences()
const { data: socials } = await useSocials()
const { data: projects } = await useFeaturedProjects()
const { data: articles } = await useArticles({ limit: 3 })
const { data: educations } = await useEducations()
const { data: info } = await useAsyncData('router-info', () =>
  $fetch<RouterInfo>('/api/router/info'),
)

useSeo()

const { trackEvent } = useTrackEvent()

const featured = computed(() => projects.value?.find((project) => project.is_featured) ?? null)
const rest = computed(() => projects.value?.filter((project) => project.id !== featured.value?.id) ?? [])
const latestExperiences = computed(() => experiences.value?.slice(0, 3) ?? [])
const currentRole = computed(() => experiences.value?.find((role) => role.is_current) ?? null)

const aboutParagraphs = computed(() =>
  (profile.value?.description ?? '')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean),
)

const careerStats = computed(() => {
  const roles = experiences.value ?? []
  const firstStart = roles.map((role) => role.start_date).sort()[0]?.slice(0, 4)
  return [
    { label: 'Since', value: firstStart ?? '—' },
    { label: 'Roles held', value: String(roles.length) },
    { label: 'Organisations', value: String(new Set(roles.map((role) => role.organization)).size) },
  ]
})
const quickFacts = computed(() => [
  { label: 'Location', value: profile.value?.location },
  { label: 'Focus', value: profile.value?.title },
  { label: 'Experience', value: experiences.value?.length ? `${experiences.value.length} roles` : null },
  { label: 'Education', value: educations.value?.length ? `${educations.value.length} programmes` : null },
].filter((fact) => fact.value))
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="min-h-[62dvh]">
      <div class="mx-auto grid w-full max-w-[1400px] items-center gap-10 px-6 py-16 md:grid-cols-[1.35fr_1fr] md:py-20">
        <RevealOnScroll>
          <h1 class="text-title">
            <template v-if="profile?.name">Hi, I'm {{ profile.name }}.</template>
            <template v-else>Software, systems, and the web.</template>
          </h1>
          <p v-if="profile?.title" class="text-subtitle text-muted-foreground mt-3">
            {{ profile.title }}
          </p>
          <p v-if="profile?.short_description" class="text-body measure mt-5">
            {{ profile.short_description }}
          </p>

          <div class="mt-6">
            <StatusDot label="Available for selected opportunities" />
          </div>

          <div class="mt-8 flex flex-wrap items-center gap-3">
            <MagneticCta to="/projects" label="View Projects" />
            <Button as-child variant="ghost" class="active:translate-y-px">
              <NuxtLink to="/about">Read About Me</NuxtLink>
            </Button>
          </div>

          <div v-if="socials?.length" class="mt-8">
            <SocialLinks :socials="socials" />
          </div>
        </RevealOnScroll>

        <RevealOnScroll :delay="0.08">
          <div class="relative mx-auto w-full max-w-sm">
            <img
              v-if="profile?.avatar_url"
              :src="profile.avatar_url"
              :alt="profile.name ? `${profile.name}` : ''"
              width="480"
              height="600"
              class="border-border aspect-[4/5] w-full rounded-lg border object-cover"
            >
            <div
              v-else
              class="border-border bg-muted/60 relative aspect-[4/5] w-full overflow-hidden rounded-lg border"
              aria-hidden="true"
            >
              <div class="bg-chart-1/25 absolute inset-x-8 top-10 h-24 rounded-md" />
              <div class="bg-chart-2/25 absolute inset-x-16 top-28 h-24 rounded-md" />
              <div class="bg-chart-3/25 absolute inset-x-6 bottom-10 h-14 rounded-md" />
              <div class="border-border absolute inset-4 rounded-md border border-dashed" />
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>

    <!-- Selected projects: zig-zag, never an equal three-column row. -->
    <SectionShell v-if="projects?.length" id="projects">
      <SectionHeading
        overline="Work"
        title="Selected Projects"
        description="Repositories synced from GitHub, curated by the owner."
      />

      <div class="mt-10 flex flex-col gap-6">
        <RevealOnScroll v-if="featured">
          <FeaturedProject :project="featured" />
        </RevealOnScroll>

        <div class="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <RevealOnScroll v-for="(project, index) in rest" :key="project.id" :delay="index * 0.06">
            <ProjectCard :project="project" />
          </RevealOnScroll>
        </div>
      </div>

      <div class="mt-8">
        <Button as-child variant="outline" class="active:translate-y-px">
          <NuxtLink to="/projects">All projects</NuxtLink>
        </Button>
      </div>
    </SectionShell>

    <!-- Experience: a stat rail beside the timeline, so the section reads as a
         career summary rather than a short list floating in whitespace. -->
    <SectionShell v-if="experiences?.length" id="experience">
      <div class="grid gap-12 lg:grid-cols-[minmax(0,19rem)_1fr] lg:gap-16">
        <div class="flex flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
          <SectionHeading overline="Career" title="Experience" />

          <dl class="divide-border border-border divide-y border-t">
            <div v-for="stat in careerStats" :key="stat.label" class="flex items-baseline justify-between gap-4 py-3">
              <dt class="text-caption text-muted-foreground">{{ stat.label }}</dt>
              <dd class="text-right font-mono text-sm">{{ stat.value }}</dd>
            </div>
          </dl>

          <div v-if="currentRole" class="border-border bg-card/60 flex flex-col gap-1 rounded-lg border p-4">
            <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">Currently</p>
            <p class="text-subtitle">{{ currentRole.title }}</p>
            <p class="text-caption text-muted-foreground">{{ currentRole.organization }}</p>
          </div>

          <Button as-child variant="outline" class="self-start active:translate-y-px">
            <NuxtLink to="/experience">Full history</NuxtLink>
          </Button>
        </div>

        <div>
          <ExperienceTimeline :experiences="latestExperiences" />
        </div>
      </div>
    </SectionShell>

    <!-- About: an editorial intro rather than a paragraph in a column. The rail
         carries the portrait and the facts so the prose can stay a single
         comfortable measure. -->
    <SectionShell v-if="profile" id="about">
      <div class="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-16">
        <div class="flex flex-col gap-6">
          <SectionHeading overline="About" title="About Me" />

          <p v-if="profile.short_description" class="text-subtitle measure">
            {{ profile.short_description }}
          </p>

          <div class="flex flex-col gap-4">
            <p
              v-for="(paragraph, index) in aboutParagraphs"
              :key="index"
              class="text-body text-muted-foreground measure"
              :class="index === 0 ? 'text-foreground' : ''"
            >
              {{ paragraph }}
            </p>
            <p v-if="!aboutParagraphs.length && !profile.short_description" class="text-body text-muted-foreground measure">
              Nothing published yet.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <Button as-child variant="outline" class="active:translate-y-px">
              <NuxtLink to="/about">
                Read the longer version
                <Icon name="ph:arrow-right" />
              </NuxtLink>
            </Button>
            <NuxtLink
              v-if="profile.email"
              :to="`mailto:${profile.email}`"
              class="text-caption text-muted-foreground hover:text-foreground font-mono transition-colors duration-200"
            >
              {{ profile.email }}
            </NuxtLink>
          </div>
        </div>

        <aside class="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <img
            v-if="profile.avatar_url"
            :src="profile.avatar_url"
            :alt="`Portrait of ${profile.name}`"
            width="480"
            height="600"
            loading="lazy"
            class="border-border aspect-[4/5] w-full rounded-xl border object-cover"
          >
          <div
            v-else
            class="border-border bg-muted/50 relative aspect-[4/5] w-full overflow-hidden rounded-xl border"
            aria-hidden="true"
          >
            <div class="bg-chart-1/25 absolute inset-x-5 top-7 h-16 rounded-md" />
            <div class="bg-chart-2/25 absolute inset-x-10 top-20 h-16 rounded-md" />
            <div class="bg-chart-3/25 absolute inset-x-3 bottom-7 h-10 rounded-md" />
            <div class="border-border absolute inset-3 rounded-md border border-dashed" />
          </div>

          <dl v-if="quickFacts.length" class="divide-border border-border divide-y border-t">
            <div v-for="fact in quickFacts" :key="fact.label" class="flex items-baseline justify-between gap-4 py-2.5">
              <dt class="text-caption text-muted-foreground">{{ fact.label }}</dt>
              <dd class="text-caption text-right font-mono">{{ fact.value }}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </SectionShell>

    <!-- Latest articles -->
    <SectionShell v-if="articles?.items.length" id="articles">
      <SectionHeading overline="Writing" title="Latest Articles" />
      <div class="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2">
        <RevealOnScroll v-for="(post, index) in articles.items" :key="post.id" :delay="index * 0.06">
          <ArticleCard :post="post" />
        </RevealOnScroll>
      </div>
      <div class="mt-8">
        <Button as-child variant="outline" class="active:translate-y-px">
          <NuxtLink to="/blog">All articles</NuxtLink>
        </Button>
      </div>
    </SectionShell>

    <!-- AI Router -->
    <SectionShell v-if="info?.enabled" id="router">
      <SectionHeading
        class="items-center text-center"
        overline="Infrastructure"
        title="AI Router"
        description="One endpoint, multiple AI providers, a quota the owner controls."
      />
      <div class="mt-10">
        <RouterEndpointCard :info="info" wide />
      </div>
    </SectionShell>

    <!-- Contact -->
    <SectionShell v-if="profile" id="contact">
      <SectionHeading overline="Contact" title="Let's build something." />
      <div class="mt-8 flex flex-col gap-4">
        <p class="text-body measure text-muted-foreground">
          Have a project, an idea, or an opportunity? Email is the fastest way to reach me.
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <Button v-if="profile.email" as-child class="active:translate-y-px">
            <a :href="`mailto:${profile.email}`" @click="trackEvent('contact_submit')">
              <Icon name="ph:envelope" />
              {{ profile.email }}
            </a>
          </Button>
          <SocialLinks v-if="socials?.length" :socials="socials" />
        </div>
      </div>
    </SectionShell>
  </div>
</template>
