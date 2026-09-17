<script setup lang="ts">
const props = defineProps<{ socials: SocialRow[] }>()

const { trackEvent } = useTrackEvent()
</script>

<template>
  <ul v-if="props.socials.length" class="flex flex-wrap items-center gap-x-4 gap-y-2">
    <li v-for="social in props.socials" :key="social.id">
      <a
        :href="social.url"
        target="_blank"
        rel="noopener noreferrer"
        class="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors duration-200"
        @click="trackEvent('social_click', { platform: social.platform })"
      >
        <Icon v-if="social.icon" :name="social.icon" class="size-4" />
        <span class="text-caption">{{ social.username || social.platform }}</span>
      </a>
    </li>
  </ul>
</template>
