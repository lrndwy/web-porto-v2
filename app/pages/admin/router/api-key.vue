<script setup lang="ts">
import { formatDate } from '#shared/utils/format'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', title: 'API Key' })

interface ApiKeyRow {
  id: string
  key_prefix: string
  key_plain: string | null
  label: string | null
  is_active: boolean
  last_used_at: string | null
  created_at: string
  revoked_at: string | null
}

const { data: key, refresh } = await useAsyncData('admin-api-key', () =>
  $fetch<ApiKeyRow | null>('/api/admin/router/api-key'),
)

const working = ref(false)
const regenerateOpen = ref(false)
const revealOpen = ref(false)
const revealedKey = ref('')

async function regenerate() {
  regenerateOpen.value = false
  working.value = true
  try {
    const result = await $fetch<{ key: string }>('/api/admin/router/api-key', { method: 'POST' })
    revealedKey.value = result.key
    revealOpen.value = true
    await refresh()
    await refreshNuxtData('admin-router-info')
  } catch (error) {
    toast.error(errorMessage(error, 'Could not generate a new key.'))
  } finally {
    working.value = false
  }
}

async function revoke() {
  if (!key.value) return
  working.value = true
  try {
    await $fetch(`/api/admin/router/api-key/${key.value.id}`, { method: 'DELETE' })
    await refresh()
    await refreshNuxtData('admin-router-info')
    toast.success('Key revoked.')
  } catch (error) {
    toast.error(errorMessage(error, 'Could not revoke the key.'))
  } finally {
    working.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <header class="flex flex-col gap-1">
      <h2 class="text-title">Public API Key</h2>
      <p class="text-caption text-muted-foreground">
        One key fronts the router. It is meant to be shareable; provider secrets never are.
      </p>
    </header>

    <section v-if="key" class="bg-card shadow-surface flex flex-col gap-5 rounded-lg border p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-caption text-muted-foreground font-mono tracking-widest uppercase">
          Public key
        </p>
        <Badge :variant="key.is_active ? 'default' : 'outline'">
          {{ key.is_active ? 'Active' : 'Revoked' }}
        </Badge>
      </div>

      <div class="flex items-center gap-2">
        <code class="min-w-0 flex-1 font-mono text-sm break-all select-all">
          {{ key.key_plain ?? `${key.key_prefix}…` }}
        </code>
        <CopyButton :value="key.key_plain ?? key.key_prefix" label="Copy the public key" />
      </div>

      <p v-if="!key.key_plain" class="text-caption text-muted-foreground">
        This key was issued before the plaintext was stored, so only its prefix can be shown.
        Regenerate to make the full key available here and on the public router page.
      </p>

      <dl class="divide-border grid gap-x-8 divide-y md:grid-cols-2 md:divide-y-0">
        <div class="flex items-center justify-between gap-4 py-3">
          <dt class="text-caption text-muted-foreground">Created</dt>
          <dd class="text-caption font-mono">{{ formatDate(key.created_at) }}</dd>
        </div>
        <div class="flex items-center justify-between gap-4 py-3">
          <dt class="text-caption text-muted-foreground">Last used</dt>
          <dd class="text-caption font-mono">{{ formatDate(key.last_used_at) }}</dd>
        </div>
      </dl>

      <p class="text-caption text-muted-foreground">
        This key is published on <span class="font-mono">/router</span> so visitors can call the
        endpoint. It is bounded by the rate limits and the monthly token quota, not by secrecy.
      </p>

      <div class="flex flex-wrap items-center gap-2">
        <Button class="active:translate-y-px" :disabled="working" @click="regenerateOpen = true">
          <Icon name="ph:arrows-clockwise" />
          Regenerate
        </Button>
        <Button variant="outline" :disabled="working" @click="revoke">
          <Icon name="ph:prohibit" />
          Revoke
        </Button>
      </div>
    </section>

    <div v-else class="bg-card shadow-surface flex flex-col gap-4 rounded-lg border p-5">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><Icon name="ph:key" /></EmptyMedia>
          <EmptyTitle>No key yet.</EmptyTitle>
          <EmptyDescription>Generate a key to make the router reachable.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button class="active:translate-y-px" :disabled="working" @click="regenerateOpen = true">
            Generate key
          </Button>
        </EmptyContent>
      </Empty>
    </div>

    <AlertDialog :open="regenerateOpen" @update:open="(open) => (regenerateOpen = open)">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Generate a new key?</AlertDialogTitle>
          <AlertDialogDescription>
            The previous key stops working immediately. Anything using it must be updated.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="regenerate">Regenerate</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Dialog :open="revealOpen" @update:open="(open) => (revealOpen = open)">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Your new key</DialogTitle>
          <DialogDescription>
            This key will not be shown again. Copy it now and store it somewhere safe.
          </DialogDescription>
        </DialogHeader>

        <div class="bg-muted flex items-center gap-2 rounded-md p-3">
          <code class="min-w-0 flex-1 truncate font-mono text-sm">{{ revealedKey }}</code>
          <CopyButton :value="revealedKey" label="Copy API key" />
        </div>

        <DialogFooter>
          <Button class="active:translate-y-px" @click="revealOpen = false">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
