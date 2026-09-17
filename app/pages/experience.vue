<script setup lang="ts">
const { data: experiences } = await useExperiences()

useSeo({ title: 'Experience' })

const stats = computed(() => {
  const roles = experiences.value ?? []
  if (!roles.length) return []

  const firstStart = roles.map((role) => role.start_date).sort()[0]
  const organisations = new Set(roles.map((role) => role.organization))
  const current = roles.find((role) => role.is_current)

  return [
    { label: 'Since', value: firstStart ? firstStart.slice(0, 4) : '—' },
    { label: 'Roles held', value: String(roles.length) },
    { label: 'Organisations', value: String(organisations.size) },
    { label: 'Currently', value: current ? current.organization : 'Open to work' },
  ]
})
</script>

<template>
  <SectionShell id="experience">
    <SectionHeading
      overline="Career"
      title="Experience"
      description="Every role, newest first — grouped by the year it started."
    />

    <!-- Summary strip: one surface divided by hairlines, not four floating cards. -->
    <dl
      v-if="stats.length"
      class="divide-border border-border shadow-surface mt-10 grid divide-y rounded-xl border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
    >
      <div v-for="stat in stats" :key="stat.label" class="flex flex-col gap-1 p-5">
        <dt class="text-caption text-muted-foreground font-mono tracking-widest uppercase">
          {{ stat.label }}
        </dt>
        <dd class="text-subtitle font-mono break-words">{{ stat.value }}</dd>
      </div>
    </dl>

    <div v-if="experiences?.length" class="mx-auto mt-14 max-w-5xl">
      <ExperienceTimeline :experiences="experiences" grouped />
    </div>

    <Empty v-else class="mt-10">
      <EmptyHeader>
        <EmptyMedia variant="icon"><Icon name="ph:briefcase" /></EmptyMedia>
        <EmptyTitle>Nothing published yet.</EmptyTitle>
        <EmptyDescription>Roles appear here once they are added in the dashboard.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  </SectionShell>
</template>
