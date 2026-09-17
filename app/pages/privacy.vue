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
</script>

<template>
  <SectionShell id="privacy">
    <SectionHeading overline="Privacy" title="What this site measures" />

    <div class="measure mt-10 flex flex-col gap-6">
      <div class="text-body flex flex-col gap-3">
        <p>
          Page views, referrers, and a small set of interaction events are recorded so the owner can
          see which writing and projects are useful. Nothing here is sold or shared, and no
          advertising network is involved.
        </p>
        <p>Each record contains:</p>
        <ul class="border-border flex list-disc flex-col gap-1 border-l pl-5">
          <li>the page path and title, and the referrer when the browser sends one;</li>
          <li>a coarse device class, browser, operating system, and the country the request came from;</li>
          <li>
            a one-way visitor hash, derived from the request IP, the user agent, and a server-side
            salt. The IP itself is never written to the database.
          </li>
        </ul>
        <p>
          Session cookies last 30 minutes and are used only to group page views into a visit. There
          is no cross-site identifier and no profile of individual visitors.
        </p>
      </div>

      <div class="border-border flex items-start justify-between gap-6 border-t pt-6">
        <div class="flex flex-col gap-1">
          <p class="text-subtitle">Do not track me</p>
          <p class="text-caption text-muted-foreground">
            Stops this browser from sending anything at all, including page views.
          </p>
        </div>
        <Switch
          v-model="trackingEnabled"
          aria-label="Do not track me"
        />
      </div>
    </div>
  </SectionShell>
</template>
