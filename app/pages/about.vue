<script setup lang="ts">
const { data: profile } = await useProfile()
const { data: socials } = await useSocials()
const { data: experiences } = await useExperiences()
const { data: educations } = await useEducations()
const { trackEvent } = useTrackEvent()

useSeo({ title: 'About', description: profile.value?.short_description ?? undefined })

const currentRole = computed(() => experiences.value?.find((role) => role.is_current) ?? null)

const facts = computed(() =>
  [
    { label: 'Location', value: profile.value?.location },
    { label: 'Focus', value: profile.value?.title },
    { label: 'Experience', value: experiences.value?.length ? `${experiences.value.length} roles` : null },
    { label: 'Education', value: educations.value?.length ? `${educations.value.length} programmes` : null },
  ].filter((fact) => fact.value),
)

const paragraphs = computed(() =>
  (profile.value?.description ?? '')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean),
)
</script>

<template>
  <div v-if="profile">
    <!-- Intro band: identity on the left, portrait on the right. -->
    <section class="border-border/70 border-b">
      <div class="mx-auto grid w-full max-w-[1400px] gap-10 px-6 py-16 md:py-20 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-16">
        <div class="flex flex-col gap-5">
          <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">About</p>

          <h1 class="text-display measure">{{ profile.name }}</h1>

          <p v-if="profile.title" class="text-subtitle text-muted-foreground">{{ profile.title }}</p>

          <p v-if="profile.short_description" class="text-body measure">{{ profile.short_description }}</p>

          <div class="flex flex-wrap items-center gap-3 pt-1">
            <Button v-if="profile.email" as-child class="active:translate-y-px">
              <a :href="`mailto:${profile.email}`" @click="trackEvent('contact_submit')">
                <Icon name="ph:envelope" />
                Get in touch
              </a>
            </Button>
            <Button as-child variant="outline" class="active:translate-y-px">
              <NuxtLink to="/cv">Download CV</NuxtLink>
            </Button>
          </div>

          <div v-if="socials?.length" class="pt-2">
            <SocialLinks :socials="socials" />
          </div>
        </div>

        <div class="lg:justify-self-end lg:pl-8">
          <img
            v-if="profile.avatar_url"
            :src="profile.avatar_url"
            :alt="`Portrait of ${profile.name}`"
            width="640"
            height="800"
            class="border-border aspect-[4/5] w-full max-w-sm rounded-xl border object-cover"
          >
          <!-- Token-coloured composition when no portrait is published. -->
          <div
            v-else
            class="border-border bg-muted/50 relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-xl border"
            aria-hidden="true"
          >
            <div class="bg-chart-1/25 absolute inset-x-6 top-8 h-24 rounded-md" />
            <div class="bg-chart-2/25 absolute inset-x-14 top-28 h-24 rounded-md" />
            <div class="bg-chart-3/25 absolute inset-x-4 bottom-8 h-14 rounded-md" />
            <div class="border-border absolute inset-3 rounded-md border border-dashed" />
          </div>

          <p v-if="profile.location" class="text-caption text-muted-foreground mt-3 inline-flex items-center gap-1.5 font-mono">
            <Icon name="ph:map-pin" class="size-3.5" />
            {{ profile.location }}
          </p>
        </div>
      </div>
    </section>

    <!-- Body: prose left, facts rail right. -->
    <SectionShell id="story">
      <div class="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:gap-16">
        <div class="flex flex-col gap-5">
          <h2 class="text-title">The longer version</h2>

          <template v-if="paragraphs.length">
            <p
              v-for="(paragraph, index) in paragraphs"
              :key="index"
              class="text-body measure"
              :class="index === 0 ? 'text-subtitle leading-relaxed' : 'text-muted-foreground'"
            >
              {{ paragraph }}
            </p>
          </template>
          <p v-else class="text-body text-muted-foreground measure">Nothing published yet.</p>
        </div>

        <aside class="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <div v-if="facts.length">
            <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">Quick Facts</p>
            <dl class="divide-border border-border mt-3 divide-y border-t">
              <div v-for="fact in facts" :key="fact.label" class="flex flex-col gap-0.5 py-3">
                <dt class="text-caption text-muted-foreground">{{ fact.label }}</dt>
                <dd class="text-caption break-words">{{ fact.value }}</dd>
              </div>
            </dl>
          </div>

          <div v-if="currentRole" class="border-border bg-card/60 flex flex-col gap-1 rounded-xl border p-4">
            <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">Currently</p>
            <p class="text-subtitle">{{ currentRole.title }}</p>
            <p class="text-caption text-muted-foreground">{{ currentRole.organization }}</p>
          </div>

          <div v-if="profile.website_url" class="border-border flex items-center gap-2 border-t pt-4">
            <Icon name="ph:link" class="text-muted-foreground size-4" />
            <a
              :href="profile.website_url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-caption text-muted-foreground hover:text-foreground font-mono break-all transition-colors duration-200"
            >
              {{ profile.website_url }}
            </a>
          </div>
        </aside>
      </div>
    </SectionShell>
  </div>

  <SectionShell v-else id="about">
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
  </SectionShell>
</template>
