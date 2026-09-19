<script setup lang="ts">
const { data: profile } = await useProfile()
const { data: experiences } = await useExperiences()
const { data: socials } = await useSocials()
const { data: projects } = await useFeaturedProjects()
const { data: articles } = await useArticles({ limit: 3 })
const { data: info } = await useAsyncData('router-info', () =>
  $fetch<RouterInfo>('/api/router/info'),
)

useSeo()

const { trackEvent } = useTrackEvent()

/** A single low-opacity accent wash for the closing CTA panel. */
const ctaWash = {
  background: 'radial-gradient(ellipse 55% 90% at 100% 0%, var(--primary), transparent 62%)',
}

const featured = computed(() => projects.value?.find((project) => project.is_featured) ?? null)
const rest = computed(() => projects.value?.filter((project) => project.id !== featured.value?.id) ?? [])
const latestExperiences = computed(() => experiences.value?.slice(0, 3) ?? [])
const currentRole = computed(() => experiences.value?.find((role) => role.is_current) ?? null)

const careerStats = computed(() => {
  const roles = experiences.value ?? []
  if (!roles.length) return []
  const firstStart = roles.map((role) => role.start_date).sort()[0]?.slice(0, 4)
  const current = roles.find((role) => role.is_current)
  return [
    { label: 'Since', value: firstStart ?? '—' },
    { label: 'Roles held', value: String(roles.length) },
    { label: 'Organisations', value: String(new Set(roles.map((role) => role.organization)).size) },
    { label: 'Currently', value: current ? current.organization : 'Open to work' },
  ]
})

/** The hero's metadata strip: facts that make the short hero feel complete. */
const heroStats = computed(() => {
  const roles = experiences.value ?? []
  return [
    { label: 'Based in', value: profile.value?.location },
    { label: 'Roles held', value: roles.length ? String(roles.length) : null },
    { label: 'Since', value: roles.map((role) => role.start_date).sort()[0]?.slice(0, 4) },
  ].filter((stat): stat is { label: string; value: string } => !!stat.value)
})
</script>

<template>
  <div>
    <!-- Hero: deliberately short. The metadata strip under the CTAs carries the
         weight that a taller, emptier hero would have spent on whitespace. -->
    <section class="border-border/70 border-b">
      <div
        class="page-shell grid gap-10 pt-12 pb-12 md:grid-cols-[1.45fr_1fr] md:items-end md:gap-16 md:pt-16 md:pb-14"
      >
        <RevealOnScroll class="flex flex-col items-start text-left">
          <p
            class="border-border/70 bg-card/60 text-[9px] text-muted-foreground mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono tracking-[0.18em] uppercase backdrop-blur-sm"
          >
            <span class="bg-primary size-1.5 rounded-full" aria-hidden="true" />
            Available for selected opportunities
          </p>

          <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl md:text-display measure">
            <template v-if="profile?.name">Hi, I'm {{ profile.name }}.</template>
            <template v-else>Software, systems, and the web.</template>
          </h1>

          <p v-if="profile?.title" class="text-base text-muted-foreground mt-3 sm:text-lg md:text-subtitle">
            {{ profile.title }}
          </p>
          <p v-if="profile?.short_description" class="text-sm text-muted-foreground measure mt-4 md:text-body">
            {{ profile.short_description }}
          </p>

          <div class="mt-8 flex flex-wrap items-center justify-start gap-3">
            <MagneticCta to="/projects" label="View Projects" />
            <Button shape="pill" as-child variant="ghost" class="active:translate-y-px">
              <NuxtLink to="/about">
                Read About Me
                <Icon name="ph:arrow-right" />
              </NuxtLink>
            </Button>
          </div>

          <dl v-if="heroStats.length" class="border-border/70 mt-10 grid max-w-xl grid-cols-3 gap-4 border-t pt-6 sm:gap-6">
            <div v-for="stat in heroStats" :key="stat.label" class="flex flex-col items-center text-left md:items-center md:text-left gap-1">
              <dt class="text-caption text-muted-foreground font-mono tracking-widest uppercase">
                {{ stat.label }}
              </dt>
              <dd class="text-caption font-mono">{{ stat.value }}</dd>
            </div>
          </dl>

          <div v-if="socials?.length" class="mt-8">
            <SocialLinks :socials="socials" />
          </div>
        </RevealOnScroll>

        <RevealOnScroll :delay="0.08" class="flex flex-col items-center md:items-end">
          <div class="relative w-full max-w-xs md:justify-self-end">
            <img
              v-if="profile?.avatar_url"
              :src="profile.avatar_url"
              :alt="profile.name ? `Portrait of ${profile.name}` : ''"
              width="420"
              height="525"
              class="border-border aspect-[4/5] w-full rounded-xl border object-cover shadow-sm"
            >
            <div
              v-else
              class="border-border bg-muted/60 relative aspect-[4/5] w-full overflow-hidden rounded-xl border"
              aria-hidden="true"
            >
              <div class="bg-chart-1/25 absolute inset-x-8 top-10 h-20 rounded-md" />
              <div class="bg-chart-2/25 absolute inset-x-14 top-24 h-20 rounded-md" />
              <div class="bg-chart-3/25 absolute inset-x-6 bottom-10 h-12 rounded-md" />
              <div class="border-border absolute inset-3 rounded-md border border-dashed" />
            </div>

            <p
              v-if="currentRole"
              class="text-caption text-muted-foreground mt-3 text-center font-mono md:text-right"
            >
              {{ currentRole.organization }} · {{ currentRole.title }}
            </p>
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
        <Button shape="pill" as-child variant="outline" class="active:translate-y-px">
          <NuxtLink to="/projects">All projects</NuxtLink>
        </Button>
      </div>
    </SectionShell>

    <!-- Experience: a full-width summary strip over the timeline, so the section
         reads as a career changelog rather than a short list in whitespace. -->
    <SectionShell v-if="experiences?.length" id="experience">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading overline="Career" title="Experience" />
        <Button shape="pill" as-child variant="outline" class="rounded-full active:scale-[0.98]">
          <NuxtLink to="/experience">
            Full history
            <Icon name="ph:arrow-right" />
          </NuxtLink>
        </Button>
      </div>

      <dl
        v-if="careerStats.length"
        class="divide-border border-border shadow-surface mt-8 grid divide-y rounded-xl border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
      >
        <div v-for="stat in careerStats" :key="stat.label" class="flex flex-col gap-1 p-5">
          <dt class="text-caption text-muted-foreground font-mono tracking-widest uppercase">
            {{ stat.label }}
          </dt>
          <dd class="text-subtitle font-mono break-words">{{ stat.value }}</dd>
        </div>
      </dl>

      <!-- Centered and width-capped: a full-bleed timeline leaves the right half
           of a 1400px page empty when the descriptions are short. -->
      <div class="mx-auto mt-12 max-w-5xl">
        <ExperienceTimeline :experiences="latestExperiences" />
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
        <Button shape="pill" as-child variant="outline" class="active:translate-y-px">
          <NuxtLink to="/blog">All articles</NuxtLink>
        </Button>
      </div>
    </SectionShell>

    <!-- AI Router -->
    <SectionShell v-if="info?.enabled" id="router">
      <SectionHeading
        overline="Infrastructure"
        title="AI Router"
        description="Free AI—no login or payment required."
      />
      <div class="mt-10">
        <RouterEndpointCard :info="info" wide />
      </div>
    </SectionShell>

    <!-- Contact: the page's closing CTA, on its own surface so it reads as an
         invitation rather than one more section. -->
    <SectionShell v-if="profile" id="contact">
      <div class="border-border/70 bg-card shadow-surface rounded-3xl border p-1.5">
        <div
          class="border-border/60 relative overflow-hidden rounded-[calc(1.5rem-0.375rem)] border px-6 py-12 md:px-12 md:py-16"
        >
          <div class="pointer-events-none absolute inset-0 opacity-[0.10]" :style="ctaWash" aria-hidden="true" />

          <div class="relative grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16">
            <div class="flex flex-col gap-4">
              <p
                class="border-border/70 bg-background/70 text-caption text-muted-foreground inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 font-mono tracking-[0.18em] uppercase"
              >
                <span class="bg-primary size-1.5 rounded-full" aria-hidden="true" />
                Contact
              </p>
              <h2 class="text-display measure">Let's build something.</h2>
              <p class="text-body text-muted-foreground measure">
                Have a project, an idea, or an opportunity? Email is the fastest way to reach me —
                I read everything.
              </p>
            </div>

            <div class="flex flex-col gap-4 lg:items-end">

            <div class="flex flex-wrap gap-3 items-end">
              <Button shape="pill"
                v-if="profile.email"
                as-child
                size="lg"
                class="rounded-full pr-1.5 pl-5 active:scale-[0.98]"
              >
                <a :href="`mailto:${profile.email}`" @click="trackEvent('contact_submit')">
                  Send a message
                  <span class="bg-primary-foreground/15 ml-2 flex size-7 items-center justify-center rounded-full">
                    <Icon name="ph:arrow-up-right" class="size-4" />
                  </span>
                </a>
              </Button>
              <Button shape="pill" as-child variant="outline" size="lg" class="rounded-full active:scale-[0.98]">
                <NuxtLink to="/cv">
                  <Icon name="ph:file-text" />
                  Download CV
                </NuxtLink>
              </Button>
            </div>


              <div v-if="socials?.length" class="lg:pt-2">
                <SocialLinks :socials="socials" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  </div>
</template>
