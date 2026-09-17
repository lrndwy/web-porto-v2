<script setup lang="ts">
import { profileSchema } from '#shared/schemas/resources'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', title: 'Profile' })

const PROFILE_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'title', label: 'Title', type: 'text', placeholder: 'Software Engineer & Founder' },
  { name: 'location', label: 'Location', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'github_username', label: 'GitHub username', type: 'text' },
  { name: 'website_url', label: 'Website', type: 'url', placeholder: 'https://…' },
  { name: 'avatar_url', label: 'Avatar', type: 'image', bucket: 'avatars' },
  { name: 'short_description', label: 'Short description', type: 'textarea', rows: 3 },
  { name: 'description', label: 'Long description', type: 'textarea', rows: 8 },
  {
    name: 'is_visible',
    label: 'Visible',
    type: 'switch',
    description: 'Hidden profiles leave the public site with no hero content.',
  },
]

const BLANK = {
  name: '',
  title: '',
  location: '',
  email: '',
  phone: '',
  github_username: '',
  website_url: '',
  avatar_url: '',
  short_description: '',
  description: '',
  is_visible: true,
}

const loaded = ref<Record<string, unknown> | null>(null)
const submitting = ref(false)

// RecordFormShell owns the vee-validate form, so the loaded row is passed in as
// its initial values and the form is keyed to re-create when data arrives.
const initial = computed(() => {
  const values: Record<string, unknown> = { ...BLANK }
  for (const key of Object.keys(BLANK)) {
    const current = loaded.value?.[key]
    if (current !== null && current !== undefined) values[key] = current
  }
  return values
})

onMounted(async () => {
  try {
    loaded.value = (await $fetch<Record<string, unknown> | null>('/api/admin/profile')) ?? {}
  } catch (error) {
    toast.error(errorMessage(error, 'Could not load the profile.'))
    loaded.value = {}
  }
})

async function onSubmit(values: Record<string, unknown>) {
  submitting.value = true
  try {
    await $fetch('/api/admin/profile', { method: 'PUT', body: values })
    toast.success('Profile saved.')
  } catch (error) {
    toast.error(errorMessage(error, 'Could not save the profile.'))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <header class="flex flex-col gap-1">
      <h2 class="text-title">Profile</h2>
      <p class="text-caption text-muted-foreground">The identity shown across the public site.</p>
    </header>

    <div v-if="!loaded" class="flex flex-col gap-4">
      <Skeleton class="h-8 w-48" />
      <Skeleton class="h-64 w-full" />
    </div>

    <ResourceFormShell
      v-else
      title="Identity"
      :schema="profileSchema"
      :initial="initial"
      :submitting="submitting"
      @submit="onSubmit"
    >
      <ResourceField v-for="field in PROFILE_FIELDS" :key="field.name" :field="field" />
    </ResourceFormShell>
  </div>
</template>
