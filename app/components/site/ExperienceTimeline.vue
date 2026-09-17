<script setup lang="ts">
import { formatMonthRange } from '#shared/utils/format'
defineProps<{ experiences: ExperienceRow[] }>()
</script>

<template>
  <ol class="border-border relative border-l">
    <li
      v-for="item in experiences"
      :key="item.id"
      class="relative grid gap-2 pb-10 pl-6 last:pb-0 md:grid-cols-[10rem_1fr] md:gap-6"
    >
      <span class="bg-primary absolute top-1.5 -left-[3px] size-1.5 rounded-full" aria-hidden="true" />

      <p class="text-caption text-muted-foreground font-mono">
        {{ formatMonthRange(item.start_date, item.end_date, item.is_current) }}
      </p>

      <div class="flex flex-col gap-1">
        <h3 class="text-subtitle">{{ item.title }}</h3>
        <p class="text-caption text-muted-foreground">
          {{ item.organization }}<template v-if="item.location"> · {{ item.location }}</template>
        </p>
        <p v-if="item.description" class="text-body measure mt-2">{{ item.description }}</p>
      </div>
    </li>
  </ol>
</template>
