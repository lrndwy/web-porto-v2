<script setup lang="ts">
import { formatDuration, formatMonthRange } from '#shared/utils/format'

const props = withDefaults(
  defineProps<{
    experiences: ExperienceRow[]
    /** Group entries under a year heading — the changelog reading. */
    grouped?: boolean
  }>(),
  { grouped: false },
)

const yearOf = (iso: string) => iso.slice(0, 4)

/** Roles arrive newest-first, so the groups inherit that order. */
const groups = computed(() => {
  if (!props.grouped) return [{ year: '', roles: props.experiences }]

  const byYear = new Map<string, ExperienceRow[]>()
  for (const role of props.experiences) {
    const year = yearOf(role.start_date)
    const bucket = byYear.get(year)
    if (bucket) bucket.push(role)
    else byYear.set(year, [role])
  }
  return [...byYear.entries()].map(([year, roles]) => ({ year, roles }))
})

/** An organisation mark: its initial in a token-tinted square, so the rail has
 *  something to look at without inventing a logo. */
const initial = (name: string) => name.trim().charAt(0).toUpperCase() || '·'
</script>

<template>
  <div class="flex flex-col" :class="props.grouped ? 'gap-10' : ''">
    <section v-for="group in groups" :key="group.year || 'all'" class="flex flex-col">
      <header v-if="group.year" class="border-border/70 mb-2 flex items-center gap-4 border-b pb-2">
        <h3 class="text-caption text-muted-foreground font-mono tracking-widest">{{ group.year }}</h3>
        <span class="bg-border/70 hidden h-px flex-1 sm:block" />
        <span class="text-caption text-muted-foreground font-mono">
          {{ group.roles.length }} {{ group.roles.length === 1 ? 'role' : 'roles' }}
        </span>
      </header>

      <ol class="flex flex-col">
        <li
          v-for="(item, index) in group.roles"
          :key="item.id"
          class="group border-border/70 relative grid gap-x-6 gap-y-3 border-t py-8 first:border-t-0 first:pt-0"
          :class="!group.year && index === 0 ? 'border-t-0 pt-0' : ''"
        >
          <div class="grid gap-x-6 gap-y-3 md:grid-cols-[8.5rem_2.5rem_minmax(0,1fr)]">
            <!-- Date rail: the changelog's version column. -->
            <div class="flex items-center gap-3 md:flex-col md:items-start md:gap-2 md:pt-0.5">
              <p class="text-caption text-muted-foreground font-mono">
                {{ formatMonthRange(item.start_date, item.end_date, item.is_current) }}
              </p>
              <span
                v-if="item.is_current"
                class="bg-primary/12 text-primary inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-caption font-mono"
              >
                <span class="bg-primary size-1 rounded-full" aria-hidden="true" />
                Now
              </span>
            </div>

            <!-- Org mark + the line that ties the entries together. -->
            <div class="relative hidden md:block">
              <span
                class="border-border/70 bg-muted text-foreground/80 group-hover:border-primary/50 group-hover:text-primary flex size-10 items-center justify-center rounded-xl border font-mono text-sm font-medium transition-colors duration-300"
                aria-hidden="true"
              >
                {{ initial(item.organization) }}
              </span>
              <span
                v-if="index < group.roles.length - 1"
                class="bg-border/70 absolute top-12 left-1/2 h-[calc(100%+1.25rem)] w-px -translate-x-1/2"
                aria-hidden="true"
              />
            </div>

            <div class="flex min-w-0 max-w-3xl flex-col gap-2">
              <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 class="text-subtitle">{{ item.title }}</h3>
                <p class="text-caption text-primary font-mono">{{ item.organization }}</p>
              </div>

              <p class="text-caption text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
                <span v-if="item.location" class="inline-flex items-center gap-1.5">
                  <Icon name="ph:map-pin" class="size-3.5" />
                  {{ item.location }}
                </span>
                <span v-if="item.location" aria-hidden="true">·</span>
                <span>{{ formatDuration(item.start_date, item.end_date, item.is_current) }}</span>
              </p>

              <p v-if="item.description" class="text-body text-muted-foreground measure">{{ item.description }}</p>
            </div>
          </div>

          <!-- A hairline that fills in on hover, so the list reads as interactive. -->
          <span
            class="bg-primary/40 absolute -top-px left-0 h-px w-0 transition-all duration-300 group-hover:w-16"
            aria-hidden="true"
          />
        </li>
      </ol>
    </section>
  </div>
</template>
