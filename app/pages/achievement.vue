<script setup lang="ts">
const { data: achievements } = await useAchievements()

useSeo({ title: 'Achievement' })
</script>

<template>
  <SectionShell id="achievement">
    <SectionHeading overline="Recognition" title="Achievement" />

    <div v-if="achievements?.length" class="mt-10">
      <AchievementGrid :achievements="achievements" />
    </div>

    <div v-else class="mt-10">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><Icon name="ph:medal" /></EmptyMedia>
          <EmptyTitle>Nothing published yet.</EmptyTitle>
          <EmptyDescription>Achievements appear here once they are added in the dashboard.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  </SectionShell>
</template>
