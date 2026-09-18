<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', title: 'Providers' })

type ProviderFormat = 'openai' | 'anthropic'

interface Provider {
  id: string
  name: string
  base_url: string
  format: ProviderFormat
  is_active: boolean
  has_secret: boolean
}

const { data: providers, refresh } = await useAsyncData('admin-providers', () =>
  $fetch<Provider[]>('/api/admin/router/providers'),
)

const { data: models } = await useAsyncData('admin-models-for-providers', () =>
  $fetch<{ provider_id: string; is_active: boolean }[]>('/api/admin/router/models'),
)

function activeModelCount(providerId: string) {
  return (models.value ?? []).filter((model) => model.provider_id === providerId && model.is_active).length
}

const dialogOpen = ref(false)
const editing = ref<Provider | null>(null)
const saving = ref(false)
const showSecret = ref(false)
const testResult = ref<Record<string, { ok: boolean; status: number; modelCount?: number; error?: string }>>({})
const testing = ref<string | null>(null)

const form = reactive({
  name: '',
  base_url: '',
  format: 'openai' as ProviderFormat,
  secret_api_key: '',
  is_active: true,
})

function openCreate() {
  editing.value = null
  Object.assign(form, {
    name: '',
    base_url: '',
    format: 'openai' as ProviderFormat,
    secret_api_key: '',
    is_active: true,
  })
  showSecret.value = false
  dialogOpen.value = true
}

function openEdit(provider: Provider) {
  editing.value = provider
  Object.assign(form, {
    name: provider.name,
    base_url: provider.base_url,
    format: provider.format,
    secret_api_key: '',
    is_active: provider.is_active,
  })
  showSecret.value = false
  dialogOpen.value = true
}

async function save() {
  saving.value = true
  try {
    const body: Record<string, unknown> = {
      name: form.name.trim(),
      base_url: form.base_url.trim(),
      format: form.format,
      is_active: form.is_active,
    }
    // An untouched field means "keep the stored secret".
    if (form.secret_api_key) body.secret_api_key = form.secret_api_key

    if (editing.value) {
      await $fetch(`/api/admin/router/providers/${editing.value.id}`, { method: 'PATCH', body })
    } else {
      await $fetch('/api/admin/router/providers', { method: 'POST', body })
    }
    await refresh()
    dialogOpen.value = false
    toast.success('Provider saved.')
  } catch (error) {
    toast.error(errorMessage(error, 'Could not save the provider.'))
  } finally {
    saving.value = false
  }
}

/**
 * Nuxt types `$fetch` against its generated route map. For a URL with a dynamic
 * segment followed by a static one, TypeScript expands that entire map and
 * gives up with "excessive stack depth". This is the one call with that shape,
 * so it takes the untyped overload instead; the result is still bound to
 * `TestOutcome`, so the shape is checked at the point of use.
 */
type TestOutcome = { ok: boolean; status: number; modelCount?: number; error?: string }
const fetchTest = $fetch as unknown as (
  url: string,
  options: { method: 'POST' },
) => Promise<TestOutcome>

async function test(id: string) {
  testing.value = id
  try {
    const endpoint: string = `/api/admin/router/providers/${id}/test`
    testResult.value[id] = await fetchTest(endpoint, { method: 'POST' })
  } catch (error) {
    toast.error(errorMessage(error, 'The connection test failed.'))
  } finally {
    testing.value = null
  }
}

const removeTarget = ref<Provider | null>(null)
// The action dialog closes before the click handler runs, which clears the
// selected provider; the id is captured separately so the delete still fires.
const removeTargetId = ref<string | null>(null)

function requestRemove(provider: Provider) {
  removeTarget.value = provider
  removeTargetId.value = provider.id
}

async function confirmRemove() {
  const id = removeTargetId.value
  if (!id) return
  removeTarget.value = null
  removeTargetId.value = null
  try {
    await $fetch(`/api/admin/router/providers/${id}`, { method: 'DELETE' })
    await refresh()
    toast.success('Provider deleted.')
  } catch (error) {
    toast.error(errorMessage(error, 'Could not delete the provider.'))
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-col gap-1">
        <h2 class="text-title">Providers</h2>
        <p class="text-caption text-muted-foreground">
          Upstream services the router can forward to. Secrets never leave the server.
        </p>
      </div>
      <Button class="active:translate-y-px" @click="openCreate">
        <Icon name="ph:plus" />
        Add provider
      </Button>
    </header>

    <div v-if="providers?.length" class="grid gap-4 md:grid-cols-2">
      <article
        v-for="provider in providers"
        :key="provider.id"
        class="bg-card shadow-surface flex flex-col gap-3 rounded-lg border p-5"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-col gap-1">
            <h3 class="text-subtitle">{{ provider.name }}</h3>
            <p class="text-caption text-muted-foreground font-mono break-all">{{ provider.base_url }}</p>
          </div>
          <Badge :variant="provider.is_active ? 'default' : 'outline'">
            {{ provider.is_active ? 'Active' : 'Inactive' }}
          </Badge>
        </div>

        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span class="text-caption text-muted-foreground font-mono">
            {{ provider.format === 'anthropic' ? 'Anthropic' : 'OpenAI-compatible' }}
          </span>
          <span class="text-caption text-muted-foreground font-mono">
            {{ activeModelCount(provider.id) }} active models
          </span>
          <StatusDot
            v-if="testResult[provider.id]"
            :tone="testResult[provider.id]?.ok ? 'primary' : 'muted'"
            :label="
              testResult[provider.id]?.ok
                ? 'Connected'
                : `Error: ${testResult[provider.id]?.error ?? testResult[provider.id]?.status}`
            "
          />
        </div>

        <div class="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <Button variant="outline" size="sm" :disabled="testing === provider.id" @click="test(provider.id)">
            {{ testing === provider.id ? 'Testing…' : 'Test connection' }}
          </Button>
          <Button variant="ghost" size="sm" @click="openEdit(provider)">Manage</Button>
          <Button
            variant="ghost"
            size="sm"
            class="text-destructive hover:text-destructive ml-auto"
            @click="requestRemove(provider)"
          >
            Delete
          </Button>
        </div>
      </article>
    </div>

    <Empty v-else>
      <EmptyHeader>
        <EmptyMedia variant="icon"><Icon name="ph:plug" /></EmptyMedia>
        <EmptyTitle>No providers yet.</EmptyTitle>
        <EmptyDescription>Add an OpenAI-compatible provider to route requests through.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button class="active:translate-y-px" @click="openCreate">Add provider</Button>
      </EmptyContent>
    </Empty>

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ editing ? 'Manage provider' : 'Add provider' }}</DialogTitle>
          <DialogDescription>
            Requests are sent to
            <span class="font-mono">{{ form.base_url }}{{ form.format === 'anthropic' ? '/messages' : '/chat/completions' }}</span>.
          </DialogDescription>
        </DialogHeader>

        <div class="grid gap-5 py-2">
          <Field>
            <FieldLabel for="provider-name">Name</FieldLabel>
            <Input id="provider-name" v-model="form.name" placeholder="OpenAI" />
          </Field>

          <Field>
            <FieldLabel for="provider-url">Base URL</FieldLabel>
            <Input id="provider-url" v-model="form.base_url" placeholder="https://api.openai.com/v1" />
          </Field>

          <Field>
            <FieldLabel for="provider-format">Format</FieldLabel>
            <Select :model-value="form.format" @update:model-value="form.format = String($event) as ProviderFormat">
              <SelectTrigger id="provider-format" class="w-full">
                <SelectValue placeholder="Select a format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI-compatible</SelectItem>
                <SelectItem value="anthropic">Anthropic Messages</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>
              The wire format this provider speaks. The gateway translates requests and responses when a client uses the other one.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel for="provider-secret">API key</FieldLabel>
            <div class="flex items-center gap-2">
              <Input
                id="provider-secret"
                v-model="form.secret_api_key"
                :type="showSecret ? 'text' : 'password'"
                :placeholder="editing?.has_secret ? '••••••••' : 'sk-…'"
              />
              <Button variant="ghost" size="icon-sm" :aria-label="showSecret ? 'Hide key' : 'Show key'" @click="showSecret = !showSecret">
                <Icon :name="showSecret ? 'ph:eye-slash' : 'ph:eye'" />
              </Button>
            </div>
            <FieldDescription v-if="editing?.has_secret">
              Leave unchanged to keep the current key.
            </FieldDescription>
          </Field>

          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel for="provider-active">Active</FieldLabel>
              <FieldDescription>Inactive providers are skipped when routing.</FieldDescription>
            </FieldContent>
            <Switch id="provider-active" v-model="form.is_active" />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="ghost" :disabled="saving" @click="dialogOpen = false">Cancel</Button>
          <Button class="active:translate-y-px" :disabled="saving" @click="save">
            {{ saving ? 'Saving…' : 'Save' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog :open="!!removeTarget" @update:open="(open) => (!open ? (removeTarget = null) : null)">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this provider?</AlertDialogTitle>
          <AlertDialogDescription>
            Providers that models or usage logs reference cannot be deleted; deactivate them instead.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-white hover:bg-destructive/90"
            @click="confirmRemove"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
