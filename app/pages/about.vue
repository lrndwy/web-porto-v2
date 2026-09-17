<script setup lang="ts">
const { data: profile } = await useProfile()
const { data: socials } = await useSocials()
const { data: experiences } = await useExperiences()
const { data: educations } = await useEducations()

useSeo({ title: 'About', description: profile.value?.short_description ?? undefined })

const quickFacts = computed(() =>
  [
    { label: 'Location', value: profile.value?.location },
    { label: 'Focus', value: profile.value?.title },
    { label: 'Experience', value: experiences.value?.length ? `${experiences.value.length} roles` : null },
    { label: 'Education', value: educations.value?.length ? `${educations.value.length} programmes` : null },
  ].filter((fact) => fact.value),
)
</script>

<template>
  <SectionShell id="about">
    <SectionHeading overline="Profile" title="About Me" />

    <div v-if="profile" class="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
      <div class="text-body measure flex flex-col gap-4">
        <p v-if="profile.description">{{ profile.description }}</p>
        <p v-else class="text-muted-foreground">Nothing published yet.</p>
      </div>

      <div v-if="quickFacts.length" class="border-t lg:border-t-0 lg:border-l lg:pl-8">
        <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">Quick Facts</p>
        <dl class="divide-border mt-2 divide-y">
          <div v-for="fact in quickFacts" :key="fact.label" class="flex justify-between gap-4 py-3">
            <dt class="text-caption text-muted-foreground">{{ fact.label }}</dt>
            <dd class="text-caption text-right">{{ fact.value }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <div v-else class="mt-10">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><Icon name="ph:user" /></EmptyMedia>
          <EmptyTitle>Nothing published yet.</EmptyTitle>
          <EmptyDescription>The profile appears here once it is added in the dashboard.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>

    <div v-if="socials?.length" class="mt-12">
      <SocialLinks :socials="socials" />
    </div>
  </SectionShell>
</template>
