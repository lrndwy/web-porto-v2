<script setup lang="ts">
const { data: experiences } = await useExperiences()

useSeo({ title: 'Experience' })
</script>

<template>
  <SectionShell id="experience">
    <SectionHeading overline="Career" title="Experience" />

    <div v-if="experiences?.length" class="mt-10">
      <ExperienceTimeline :experiences="experiences" />
    </div>

    <div v-else class="mt-10">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><Icon name="ph:briefcase" /></EmptyMedia>
          <EmptyTitle>Nothing published yet.</EmptyTitle>
          <EmptyDescription>Roles appear here once they are added in the dashboard.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  </SectionShell>
</template>
