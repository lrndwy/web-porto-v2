<script setup lang="ts">
const props = defineProps<{
  index: number
  count: number
}>()

const emit = defineEmits<{ move: [direction: -1 | 1] }>()
</script>

<template>
  <div class="flex items-center gap-0.5">
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label="Move up"
      :disabled="props.index === 0"
      @click="emit('move', -1)"
    >
      <Icon name="ph:caret-up" />
    </Button>
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label="Move down"
      :disabled="props.index >= props.count - 1"
      @click="emit('move', 1)"
    >
      <Icon name="ph:caret-down" />
    </Button>
  </div>
</template>
