<script setup lang="ts">
const { data: profile } = await useProfile()
const { data: socials } = await useSocials()
const { trackEvent } = useTrackEvent()

useSeo({ title: 'Contact', description: 'Projects, ideas, and opportunities.' })
</script>

<template>
  <SectionShell id="contact">
    <SectionHeading
      overline="Contact"
      title="Let's build something."
      description="Have a project, an idea, or an opportunity?"
    />

    <div class="mt-10 flex max-w-xl flex-col gap-6">
      <div v-if="profile?.email" class="flex flex-col gap-3">
        <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">Email</p>
        <Button as-child class="self-start active:translate-y-px">
          <a :href="`mailto:${profile.email}`" @click="trackEvent('contact_submit')">
            <Icon name="ph:envelope" />
            {{ profile.email }}
          </a>
        </Button>
      </div>

      <div v-if="socials?.length" class="flex flex-col gap-3">
        <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">Elsewhere</p>
        <SocialLinks :socials="socials" />
      </div>

      <p v-if="!profile?.email && !socials?.length" class="text-body text-muted-foreground">
        Contact details appear here once the owner publishes them.
      </p>
    </div>
  </SectionShell>
</template>
