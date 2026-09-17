<script setup lang="ts">
const { data: educations } = await useEducations()

useSeo({ title: 'Education' })
</script>

<template>
  <SectionShell id="education">
    <SectionHeading overline="Study" title="Education" />

    <div v-if="educations?.length" class="mt-10">
      <EducationList :educations="educations" />
    </div>

    <div v-else class="mt-10">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><Icon name="ph:graduation-cap" /></EmptyMedia>
          <EmptyTitle>Nothing published yet.</EmptyTitle>
          <EmptyDescription>Programmes appear here once they are added in the dashboard.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  </SectionShell>
</template>
