<script setup lang="ts">
const { data: experiences } = await useExperiences()

useSeo({ title: 'Experience' })

const stats = computed(() => {
  const roles = experiences.value ?? []
  if (!roles.length) return []
  const firstStart = roles.map((role) => role.start_date).sort()[0]?.slice(0, 4)
  return [
    { label: 'Since', value: firstStart ?? '—' },
    { label: 'Roles held', value: String(roles.length) },
    { label: 'Organisations', value: String(new Set(roles.map((role) => role.organization)).size) },
    {
      label: 'Currently',
      value: roles.find((role) => role.is_current)?.organization ?? 'Open to work',
    },
  ]
})
</script>

<template>
  <SectionShell id="experience">
    <!-- The rail sits left and the history right, so the eye lands on the roles
         first and the summary stays available while scrolling. -->
    <div class="grid gap-12 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-16">
      <div class="flex flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
        <SectionHeading
          overline="Career"
          title="Experience"
          description="Roles in reverse chronological order, with the current one first."
        />

        <dl v-if="stats.length" class="divide-border border-border divide-y border-t">
          <div v-for="stat in stats" :key="stat.label" class="flex items-baseline justify-between gap-4 py-3">
            <dt class="text-caption text-muted-foreground">{{ stat.label }}</dt>
            <dd class="text-right font-mono text-sm">{{ stat.value }}</dd>
          </div>
        </dl>

        <Button as-child variant="outline" class="self-start active:translate-y-px">
          <NuxtLink to="/cv">
            <Icon name="ph:file-text" />
            Download CV
          </NuxtLink>
        </Button>
      </div>

      <div>
        <ExperienceTimeline v-if="experiences?.length" :experiences="experiences" />

        <Empty v-else>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Icon name="ph:briefcase" /></EmptyMedia>
            <EmptyTitle>Nothing published yet.</EmptyTitle>
            <EmptyDescription>Roles appear here once they are added in the dashboard.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </div>
  </SectionShell>
</template>
