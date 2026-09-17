<script setup lang="ts">
defineProps<{ experiences: ExperienceRow[] }>()

const yearOf = (iso: string) => iso.slice(0, 4)
</script>

<template>
  <ol class="flex flex-col">
    <li
      v-for="(item, index) in experiences"
      :key="item.id"
      class="group border-border relative border-t py-7 first:border-t-0 first:pt-0 md:grid md:grid-cols-[9rem_1fr] md:gap-8"
    >
      <!-- Date rail -->
      <div class="flex items-center gap-2 md:flex-col md:items-start md:gap-1 md:pt-1">
        <p class="text-caption text-muted-foreground font-mono">
          {{ yearOf(item.start_date) }} — {{ item.is_current ? 'Present' : item.end_date ? yearOf(item.end_date) : 'Present' }}
        </p>
        <span
          v-if="item.is_current"
          class="bg-primary/12 text-primary inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-caption font-mono"
        >
          <span class="bg-primary size-1 rounded-full" aria-hidden="true" />
          Now
        </span>
      </div>

      <div class="mt-2 flex flex-col gap-2 md:mt-0">
        <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 class="text-subtitle">{{ item.title }}</h3>
          <p class="text-caption text-primary font-mono">{{ item.organization }}</p>
        </div>

        <p v-if="item.location" class="text-caption text-muted-foreground inline-flex items-center gap-1.5">
          <Icon name="ph:map-pin" class="size-3.5" />
          {{ item.location }}
        </p>

        <p v-if="item.description" class="text-body text-muted-foreground measure">{{ item.description }}</p>
      </div>

      <!-- A hairline that fills in on hover, so the list reads as interactive. -->
      <span
        class="bg-primary/40 absolute -top-px left-0 h-px w-0 transition-all duration-300 group-hover:w-16"
        aria-hidden="true"
      />
      <span v-if="index === experiences.length - 1" class="sr-only">End of history</span>
    </li>
  </ol>
</template>
