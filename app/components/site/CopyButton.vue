<script setup lang="ts">
const props = defineProps<{ value: string; label?: string }>()

const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // The clipboard is unavailable (insecure context or denied permission).
  }
}
</script>

<template>
  <Button
    variant="ghost"
    size="icon-sm"
    :aria-label="props.label ?? 'Copy to clipboard'"
    @click="copy"
  >
    <Icon :name="copied ? 'ph:check' : 'ph:copy'" />
  </Button>
  <span aria-live="polite" class="sr-only">{{ copied ? 'Copied' : '' }}</span>
</template>
