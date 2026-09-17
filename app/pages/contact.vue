<script setup lang="ts">
const { data: profile } = await useProfile()
const { data: socials } = await useSocials()
const { trackEvent } = useTrackEvent()

useSeo({ title: 'Contact', description: 'Projects, ideas, and opportunities.' })
</script>

<template>
  <SectionShell id="contact">
    <div class="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
      <!-- Left: the ask -->
      <div class="flex flex-col gap-8">
        <SectionHeading
          overline="Contact"
          title="Let's build something."
          description="Have a project, an idea, or an opportunity? Email is the fastest way to reach me — I read everything and reply to most within a day or two."
        />

        <div v-if="profile?.email" class="flex flex-col gap-3">
          <Button as-child size="lg" class="self-start active:translate-y-px">
            <a :href="`mailto:${profile.email}`" @click="trackEvent('contact_submit')">
              <Icon name="ph:envelope" />
              {{ profile.email }}
            </a>
          </Button>
          <CopyButton :value="profile.email" label="Copy email address" class="self-start" />
        </div>

        <div class="border-border bg-card/60 flex flex-col gap-2 rounded-xl border p-5">
          <StatusDot label="Available for selected opportunities" />
          <p class="text-caption text-muted-foreground">
            Contract, collaboration, and advisory work. Full-time roles considered for the right team.
          </p>
        </div>
      </div>

      <!-- Right: elsewhere -->
      <div class="flex flex-col gap-6 lg:pt-4">
        <div v-if="socials?.length" class="flex flex-col gap-3">
          <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">Elsewhere</p>
          <ul class="divide-border border-border divide-y border-t">
            <li v-for="social in socials" :key="social.id">
              <a
                :href="social.url"
                target="_blank"
                rel="noopener noreferrer"
                class="group flex items-center justify-between gap-4 py-4 transition-colors duration-200"
                @click="trackEvent('social_click', { platform: social.platform })"
              >
                <span class="flex items-center gap-3">
                  <Icon v-if="social.icon" :name="social.icon" class="text-muted-foreground size-4" />
                  <span class="text-body">{{ social.platform }}</span>
                </span>
                <span class="text-caption text-muted-foreground flex items-center gap-2 font-mono">
                  {{ social.username }}
                  <Icon
                    name="ph:arrow-up-right"
                    class="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </a>
            </li>
          </ul>
        </div>

        <div v-if="profile?.location" class="border-border flex items-center gap-2 border-t pt-6">
          <Icon name="ph:map-pin" class="text-muted-foreground size-4" />
          <p class="text-caption text-muted-foreground">
            Based in {{ profile.location }} — working with teams remotely.
          </p>
        </div>

        <p v-if="!profile?.email && !socials?.length" class="text-body text-muted-foreground">
          Contact details appear here once the owner publishes them.
        </p>
      </div>
    </div>
  </SectionShell>
</template>
