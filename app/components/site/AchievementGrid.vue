<script setup lang="ts">
import { formatDate } from '#shared/utils/format'
defineProps<{ achievements: AchievementRow[] }>()
</script>

<template>
  <ul class="divide-border divide-y">
    <li
      v-for="item in achievements"
      :key="item.id"
      class="grid gap-2 py-5 md:grid-cols-[1fr_10rem] md:items-baseline md:gap-6"
    >
      <div class="flex flex-col gap-1">
        <h3 class="text-subtitle">{{ item.title }}</h3>
        <p class="text-caption text-muted-foreground">{{ item.issuer }}</p>
        <p v-if="item.description" class="text-body measure mt-1">{{ item.description }}</p>
      </div>

      <div class="flex items-center gap-4 md:justify-end">
        <span class="text-caption text-muted-foreground font-mono">
          {{ formatDate(item.achievement_date) }}
        </span>
        <a
          v-if="item.certificate_url"
          :href="item.certificate_url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-caption text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors duration-200"
        >
          Certificate
          <Icon name="ph:arrow-right" class="size-3.5" />
        </a>
      </div>
    </li>
  </ul>
</template>
