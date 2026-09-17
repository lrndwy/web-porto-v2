<script setup lang="ts">
import { formatMonthRange } from '#shared/utils/format'
defineProps<{ educations: EducationRow[] }>()
</script>

<template>
  <ol class="border-border relative border-l">
    <li
      v-for="item in educations"
      :key="item.id"
      class="relative grid gap-2 pb-10 pl-6 last:pb-0 md:grid-cols-[10rem_1fr] md:gap-6"
    >
      <span class="bg-primary absolute top-1.5 -left-[3px] size-1.5 rounded-full" aria-hidden="true" />

      <p class="text-caption text-muted-foreground font-mono">
        {{ formatMonthRange(item.start_date, item.end_date, false) }}
      </p>

      <div class="flex flex-col gap-1">
        <h3 class="text-subtitle">{{ item.institution }}</h3>
        <p class="text-caption text-muted-foreground">
          {{ item.degree }}<template v-if="item.field"> · {{ item.field }}</template>
        </p>
        <p v-if="item.description" class="text-body measure mt-2">{{ item.description }}</p>
      </div>
    </li>
  </ol>
</template>
