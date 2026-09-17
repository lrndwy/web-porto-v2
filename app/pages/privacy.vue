<script setup lang="ts">
useSeo({ title: 'Privacy' })

const TRACKING_KEY = 'wp-track'

const trackingEnabled = ref(true)

onMounted(() => {
  trackingEnabled.value = localStorage.getItem(TRACKING_KEY) !== 'off'
  document.documentElement.dataset.track = trackingEnabled.value ? 'on' : 'off'
})

watch(trackingEnabled, (enabled) => {
  localStorage.setItem(TRACKING_KEY, enabled ? 'on' : 'off')
  document.documentElement.dataset.track = enabled ? 'on' : 'off'
})

/** What is written, why, and how long it lives. */
const COLLECTED = [
  {
    field: 'Page path and title',
    why: 'Shows which writing and projects are actually read.',
    retention: 'Indefinite',
  },
  {
    field: 'Referrer',
    why: 'Separates direct visits from search and social.',
    retention: 'Indefinite',
  },
  {
    field: 'Device class, browser, OS',
    why: 'Catches layout and compatibility problems.',
    retention: 'Indefinite',
  },
  {
    field: 'Country',
    why: 'Coarse geography only — never a city or an address.',
    retention: 'Indefinite',
  },
  {
    field: 'One-way visitor hash',
    why: 'Counts unique visitors without identifying them.',
    retention: 'Indefinite',
  },
  {
    field: 'Session cookie',
    why: 'Groups page views into a single visit.',
    retention: '30 minutes',
  },
]
</script>

<template>
  <SectionShell id="privacy">
    <SectionHeading overline="Privacy" title="What this site measures" />

    <div class="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
      <div class="flex flex-col gap-8">
        <div class="text-body measure flex flex-col gap-4">
          <p>
            Page views, referrers, and a small set of interaction events are recorded so the owner can
            see which writing and projects are useful. Nothing here is sold, shared, or fed to an
            advertising network, and there is no third-party analytics script on the page.
          </p>
          <p>
            There is no cross-site identifier and no profile of individual visitors. The raw IP
            address is used in memory to derive a visitor hash and is never written to the database.
          </p>
        </div>

        <!-- Field-by-field disclosure: a divided table, not a card grid. -->
        <div>
          <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">
            What is stored
          </p>
          <ul class="divide-border border-border mt-3 divide-y border-t">
            <li
              v-for="entry in COLLECTED"
              :key="entry.field"
              class="grid gap-1 py-4 md:grid-cols-[12rem_1fr_7rem] md:items-baseline md:gap-6"
            >
              <p class="text-caption font-mono">{{ entry.field }}</p>
              <p class="text-caption text-muted-foreground">{{ entry.why }}</p>
              <p class="text-caption text-muted-foreground md:text-right font-mono">
                {{ entry.retention }}
              </p>
            </li>
          </ul>
        </div>

        <p class="text-caption text-muted-foreground measure">
          The visitor hash is derived from the request IP, the user agent, and a server-side salt.
          Because the salt is stable, unique-visitor counts work across periods; rotating it is a
          deliberate reset of that history.
        </p>
      </div>

      <!-- The control, given its own surface so it is impossible to miss. -->
      <aside class="lg:sticky lg:top-24 lg:self-start">
        <div class="bg-card shadow-surface flex flex-col gap-4 rounded-xl border p-6">
          <div class="flex flex-col gap-1">
            <p class="text-subtitle">Do not track me</p>
            <p class="text-caption text-muted-foreground">
              Stops this browser from sending anything at all — including page views. The setting is
              stored locally and applies immediately.
            </p>
          </div>

          <div class="border-border flex items-center justify-between gap-4 border-t pt-4">
            <span class="text-caption font-mono">
              {{ trackingEnabled ? 'Tracking is on' : 'Tracking is off' }}
            </span>
            <Switch v-model="trackingEnabled" aria-label="Do not track me" />
          </div>

          <p class="text-caption text-muted-foreground">
            Clearing site data resets this choice. There is no account, so there is nothing else to
            delete on request.
          </p>
        </div>
      </aside>
    </div>
  </SectionShell>
</template>
