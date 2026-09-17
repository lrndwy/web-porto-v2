<script setup lang="ts">
const props = withDefaults(
  defineProps<{ value: string; label?: string; shape?: 'default' | 'pill' }>(),
  // Pill by default: this button lives on public pages. The owner dashboard
  // passes `default` so its toolbars keep the tighter radius.
  { shape: 'pill' },
)

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
    :shape="props.shape"
    :aria-label="props.label ?? 'Copy to clipboard'"
    @click="copy"
  >
    <Icon :name="copied ? 'ph:check' : 'ph:copy'" />
  </Button>
  <span aria-live="polite" class="sr-only">{{ copied ? 'Copied' : '' }}</span>
</template>
