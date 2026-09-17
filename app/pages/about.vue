<script setup lang="ts">
const { data: profile } = await useProfile()
const { data: socials } = await useSocials()
const { data: experiences } = await useExperiences()
const { data: educations } = await useEducations()
const { trackEvent } = useTrackEvent()

useSeo({ title: 'About', description: profile.value?.short_description ?? undefined })

const currentRole = computed(() => experiences.value?.find((role) => role.is_current) ?? null)

const paragraphs = computed(() =>
  (profile.value?.description ?? '')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean),
)

/**
 * A reading page, not a landing page: the identity sits in a narrow rail and
 * the prose gets the wide column, so nothing here competes with the homepage
 * hero.
 */
const facts = computed(() =>
  [
    { label: 'Focus', value: profile.value?.title },
    { label: 'Location', value: profile.value?.location },
    {
      label: 'Experience',
      value: experiences.value?.length ? `${experiences.value.length} roles` : null,
    },
    {
      label: 'Education',
      value: educations.value?.length ? `${educations.value.length} programmes` : null,
    },
    { label: 'Website', value: profile.value?.website_url },
  ].filter((fact): fact is { label: string; value: string } => !!fact.value),
)

const elsewhere = [
  { to: '/experience', label: 'Experience', icon: 'ph:briefcase' },
  { to: '/achievement', label: 'Achievement', icon: 'ph:medal' },
  { to: '/education', label: 'Education', icon: 'ph:graduation-cap' },
  { to: '/projects', label: 'Projects', icon: 'ph:folders' },
]
</script>

<template>
  <SectionShell id="about">
    <template v-if="profile">
      <div class="grid gap-12 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-16">
        <!-- Identity rail -->
        <aside class="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <div class="border-border/70 bg-muted/25 rounded-2xl border p-1.5">
            <img
              v-if="profile.avatar_url"
              :src="profile.avatar_url"
              :alt="`Portrait of ${profile.name}`"
              width="560"
              height="700"
              class="border-border/60 aspect-[4/5] w-full rounded-[calc(1rem-0.375rem)] border object-cover"
            >
            <div
              v-else
              class="border-border/60 bg-card relative aspect-[4/5] w-full overflow-hidden rounded-[calc(1rem-0.375rem)] border"
              aria-hidden="true"
            >
              <div class="bg-chart-1/25 absolute inset-x-5 top-7 h-16 rounded-md" />
              <div class="bg-chart-2/25 absolute inset-x-10 top-20 h-16 rounded-md" />
              <div class="bg-chart-3/25 absolute inset-x-3 bottom-7 h-10 rounded-md" />
              <div class="border-border absolute inset-3 rounded-md border border-dashed" />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <h1 class="text-title">{{ profile.name }}</h1>
            <p v-if="profile.title" class="text-caption text-muted-foreground">{{ profile.title }}</p>
            <p v-if="profile.location" class="text-caption text-muted-foreground inline-flex items-center gap-1.5 font-mono">
              <Icon name="ph:map-pin" class="size-3.5" />
              {{ profile.location }}
            </p>
          </div>

          <Button shape="pill" v-if="profile.email" as-child class="rounded-full active:scale-[0.98]">
            <a :href="`mailto:${profile.email}`" @click="trackEvent('contact_submit')">
              Get in touch
              <Icon name="ph:arrow-up-right" />
            </a>
          </Button>

          <div v-if="socials?.length" class="border-border/70 border-t pt-4">
            <SocialLinks :socials="socials" />
          </div>
        </aside>

        <!-- Reading column -->
        <div class="flex flex-col gap-14">
          <div class="flex flex-col gap-5">
            <SectionHeading overline="About" title="The longer version" />

            <template v-if="paragraphs.length">
              <p class="text-subtitle measure">{{ paragraphs[0] }}</p>
              <p
                v-for="(paragraph, index) in paragraphs.slice(1)"
                :key="index"
                class="text-body text-muted-foreground measure"
              >
                {{ paragraph }}
              </p>
            </template>
            <p v-else-if="profile.short_description" class="text-body measure">
              {{ profile.short_description }}
            </p>
            <p v-else class="text-body text-muted-foreground measure">Nothing published yet.</p>
          </div>

          <!-- At a glance: a divided list, not a card grid. -->
          <div v-if="facts.length">
            <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">
              At a glance
            </p>
            <dl class="divide-border border-border mt-3 divide-y border-t">
              <div
                v-for="fact in facts"
                :key="fact.label"
                class="grid gap-1 py-3 md:grid-cols-[9rem_1fr] md:items-baseline md:gap-6"
              >
                <dt class="text-caption text-muted-foreground">{{ fact.label }}</dt>
                <dd class="text-caption break-words">{{ fact.value }}</dd>
              </div>
            </dl>
          </div>

          <div v-if="currentRole" class="border-border/70 bg-card/60 flex flex-col gap-1 rounded-2xl border p-5">
            <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">Currently</p>
            <p class="text-subtitle">{{ currentRole.title }}</p>
            <p class="text-caption text-muted-foreground">
              {{ currentRole.organization }}
              <template v-if="currentRole.location"> · {{ currentRole.location }}</template>
            </p>
          </div>

          <!-- Where to go next: structural, not decorative. -->
          <nav class="border-border/70 border-t pt-6" aria-label="More about the work">
            <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">
              Keep reading
            </p>
            <ul class="mt-3 flex flex-wrap gap-2">
              <li v-for="link in elsewhere" :key="link.to">
                <NuxtLink
                  :to="link.to"
                  class="border-border/70 bg-card/60 hover:border-primary/40 hover:text-foreground text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-caption transition-colors duration-200"
                >
                  <Icon :name="link.icon" class="size-3.5" />
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </template>

    <template v-else>
      <SectionHeading overline="Profile" title="About Me" />
      <div class="mt-10">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Icon name="ph:user" /></EmptyMedia>
            <EmptyTitle>Nothing published yet.</EmptyTitle>
            <EmptyDescription>The profile appears here once it is added in the dashboard.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </template>
  </SectionShell>
</template>
