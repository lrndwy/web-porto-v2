<script setup lang="ts">
import { useMagicKeys, whenever } from '@vueuse/core'

interface CommandAction {
  label: string
  icon: string
  to: string
  external?: boolean
  shortcut?: string
}

const actions: CommandAction[] = [
  { label: 'Edit Profile', icon: 'ph:user', to: '/admin/profile' },
  { label: 'Create Blog', icon: 'ph:article', to: '/admin/blog/new' },
  { label: 'Manage Providers', icon: 'ph:plug', to: '/admin/router/providers' },
  { label: 'View Analytics', icon: 'ph:chart-line', to: '/admin/analytics' },
  { label: 'Open Public Website', icon: 'ph:arrow-up-right', to: '/', external: true },
]

const open = ref(false)
const router = useRouter()

// `onEventFired` stops the browser's own ⌘K binding from stealing the keypress.
// The map's values are typed optional, so each key gets a concrete ref.
const keys = useMagicKeys({
  passive: false,
  onEventFired(event) {
    if (event.key === 'k' && (event.metaKey || event.ctrlKey)) event.preventDefault()
  },
})

const metaK = keys['meta+k'] ?? ref(false)
const ctrlK = keys['ctrl+k'] ?? ref(false)

whenever(metaK, () => (open.value = !open.value))
whenever(ctrlK, () => (open.value = !open.value))

function run(action: CommandAction) {
  open.value = false
  if (action.external) {
    window.open(action.to, '_blank', 'noopener,noreferrer')
    return
  }
  router.push(action.to)
}
</script>

<template>
  <Button
    variant="outline"
    size="sm"
    class="text-muted-foreground justify-start gap-2 md:w-56"
    aria-label="Open command menu"
    @click="open = true"
  >
    <Icon name="ph:magnifying-glass" />
    <span class="hidden md:inline">Search…</span>
    <kbd
      class="border-border bg-muted text-caption ml-auto hidden rounded border px-1.5 py-0.5 font-mono md:inline-flex"
    >
      ⌘K
    </kbd>
  </Button>

  <CommandDialog v-model:open="open" title="Command menu" description="Jump to an admin action">
    <CommandInput placeholder="Type a command…" />
    <CommandList>
      <CommandEmpty>No matching action.</CommandEmpty>
      <CommandGroup heading="Actions">
        <CommandItem
          v-for="action in actions"
          :key="action.label"
          :value="action.label"
          @select="run(action)"
        >
          <Icon :name="action.icon" />
          <span>{{ action.label }}</span>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</template>
