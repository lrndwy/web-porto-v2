<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', title: 'Website' })

interface SiteSettings {
  site_name: string
  logo_url: string | null
  favicon_url: string | null
  meta_title: string | null
  meta_description: string | null
  og_image_url: string | null
  maintenance_mode: boolean
}

const { data: settings, refresh } = await useAsyncData('admin-site-settings', () =>
  $fetch<SiteSettings>('/api/admin/settings/site'),
)

const form = reactive<SiteSettings>({
  site_name: '',
  logo_url: null,
  favicon_url: null,
  meta_title: null,
  meta_description: null,
  og_image_url: null,
  maintenance_mode: false,
})

watchEffect(() => {
  if (settings.value) Object.assign(form, settings.value)
})

const saving = ref(false)
async function save() {
  saving.value = true
  try {
    await $fetch('/api/admin/settings/site', { method: 'PUT', body: { ...form } })
    await refresh()
    toast.success('Website settings saved.')
  } catch (error) {
    toast.error(errorMessage(error, 'Could not save the website settings.'))
  } finally {
    saving.value = false
  }
}

// Navigation items are a generic resource, so the shared list machinery
// handles ordering, visibility, and the add/edit dialog.
const NAV_COLUMNS: ColumnDef[] = [
  { key: 'label', label: 'Label' },
  { key: 'path', label: 'Path', mono: true },
  { key: 'icon', label: 'Icon', mono: true },
]

const navDialogOpen = ref(false)
const navEditing = ref<Record<string, unknown> | null>(null)
const navSaving = ref(false)
const { create: createNav, update: updateNav } = useResource('navigation')

const navForm = reactive({ label: '', path: '', icon: '', is_external: false, is_visible: true })

const ICON_OPTIONS = [
  'ph:house',
  'ph:user',
  'ph:briefcase',
  'ph:folders',
  'ph:article',
  'ph:sparkle',
  'ph:envelope',
  'ph:graduation-cap',
  'ph:medal',
  'ph:file-text',
]

function openNavCreate() {
  navEditing.value = null
  Object.assign(navForm, { label: '', path: '', icon: '', is_external: false, is_visible: true })
  navDialogOpen.value = true
}

function openNavEdit(row: Record<string, unknown>) {
  navEditing.value = row
  Object.assign(navForm, {
    label: String(row.label ?? ''),
    path: String(row.path ?? ''),
    icon: String(row.icon ?? ''),
    is_external: Boolean(row.is_external),
    is_visible: Boolean(row.is_visible),
  })
  navDialogOpen.value = true
}

async function saveNav(refreshList: () => Promise<void>) {
  navSaving.value = true
  const result = navEditing.value
    ? await updateNav(String(navEditing.value.id), { ...navForm })
    : await createNav({ ...navForm })
  navSaving.value = false
  if (result) {
    navDialogOpen.value = false
    await refreshList()
  }
}

const maintenanceOpen = ref(false)
</script>

<template>
  <div class="flex flex-col gap-10">
    <header class="flex flex-col gap-1">
      <h2 class="text-title">Website</h2>
      <p class="text-caption text-muted-foreground">
        Identity, navigation, SEO defaults, and maintenance mode.
      </p>
    </header>

    <!-- General -->
    <section id="general" class="bg-card shadow-surface flex scroll-mt-20 flex-col gap-5 rounded-lg border p-5">
      <h3 class="text-subtitle">General</h3>

      <div class="grid gap-5 md:grid-cols-2">
        <Field>
          <FieldLabel for="site-name">Site name</FieldLabel>
          <Input id="site-name" v-model="form.site_name" />
        </Field>
      </div>

      <div class="grid gap-5 md:grid-cols-2">
        <Field>
          <FieldLabel>Logo</FieldLabel>
          <ImageUploadField v-model="form.logo_url" bucket="site-assets" />
        </Field>
        <Field>
          <FieldLabel>Favicon</FieldLabel>
          <ImageUploadField v-model="form.favicon_url" bucket="site-assets" />
        </Field>
      </div>

      <div>
        <Button class="active:translate-y-px" :disabled="saving" @click="save">
          {{ saving ? 'Saving…' : 'Save general settings' }}
        </Button>
      </div>
    </section>

    <!-- Navigation -->
    <section id="navigation" class="flex scroll-mt-20 flex-col gap-5">
      <h3 class="text-subtitle">Navigation</h3>
      <ResourceListPage
        resource="navigation"
        title="Items"
        description="Order and visibility apply to the public header immediately."
        :columns="NAV_COLUMNS"
        :toggles="['is_visible']"
        orderable
        add-label="Add item"
        empty-title="No navigation items yet."
        empty-body="Add the pages visitors should be able to reach."
        @create="openNavCreate"
        @edit="openNavEdit"
      >
        <template #dialogs="{ refresh: refreshNav }">
          <Dialog v-model:open="navDialogOpen">
            <DialogContent class="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{{ navEditing ? 'Edit item' : 'Add item' }}</DialogTitle>
              </DialogHeader>

              <div class="grid gap-5 py-2">
                <Field>
                  <FieldLabel for="nav-label">Label</FieldLabel>
                  <Input id="nav-label" v-model="navForm.label" placeholder="Projects" />
                </Field>

                <Field>
                  <FieldLabel for="nav-path">Path or URL</FieldLabel>
                  <Input id="nav-path" v-model="navForm.path" placeholder="/projects" />
                </Field>

                <Field>
                  <FieldLabel for="nav-icon">Icon</FieldLabel>
                  <Select :model-value="navForm.icon" @update:model-value="navForm.icon = String($event)">
                    <SelectTrigger id="nav-icon" class="w-full">
                      <SelectValue placeholder="No icon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="icon in ICON_OPTIONS" :key="icon" :value="icon">
                        {{ icon }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>Limited to the Phosphor collection.</FieldDescription>
                </Field>

                <div class="flex flex-wrap gap-6">
                  <Field orientation="horizontal" class="flex-row items-center gap-3">
                    <FieldLabel for="nav-external">External link</FieldLabel>
                    <Switch id="nav-external" v-model="navForm.is_external" />
                  </Field>
                  <Field orientation="horizontal" class="flex-row items-center gap-3">
                    <FieldLabel for="nav-visible">Visible</FieldLabel>
                    <Switch id="nav-visible" v-model="navForm.is_visible" />
                  </Field>
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" :disabled="navSaving" @click="navDialogOpen = false">Cancel</Button>
                <Button class="active:translate-y-px" :disabled="navSaving" @click="saveNav(refreshNav)">
                  {{ navSaving ? 'Saving…' : 'Save' }}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </template>
      </ResourceListPage>
    </section>

    <!-- SEO -->
    <section id="seo" class="bg-card shadow-surface flex scroll-mt-20 flex-col gap-5 rounded-lg border p-5">
      <h3 class="text-subtitle">SEO</h3>

      <Field>
        <FieldLabel for="meta-title">Default meta title</FieldLabel>
        <Input id="meta-title" :model-value="form.meta_title ?? ''" @update:model-value="form.meta_title = String($event)" />
      </Field>

      <Field>
        <FieldLabel for="meta-description">Default meta description</FieldLabel>
        <Textarea id="meta-description" :model-value="form.meta_description ?? ''" :rows="3" @update:model-value="form.meta_description = String($event)" />
      </Field>

      <Field>
        <FieldLabel>Open Graph image</FieldLabel>
        <ImageUploadField v-model="form.og_image_url" bucket="site-assets" />
      </Field>

      <!-- Live preview of the resulting card. -->
      <div class="border-border max-w-md overflow-hidden rounded-lg border">
        <img v-if="form.og_image_url" :src="form.og_image_url" alt="" class="aspect-[1.91/1] w-full object-cover">
        <div v-else class="bg-muted flex aspect-[1.91/1] items-center justify-center">
          <span class="text-caption text-muted-foreground">No image selected</span>
        </div>
        <div class="flex flex-col gap-1 p-4">
          <p class="text-caption text-muted-foreground font-mono">example.com</p>
          <p class="text-subtitle truncate">{{ form.meta_title || form.site_name }}</p>
          <p class="text-caption text-muted-foreground line-clamp-2">
            {{ form.meta_description || 'No description set.' }}
          </p>
        </div>
      </div>

      <div>
        <Button class="active:translate-y-px" :disabled="saving" @click="save">
          {{ saving ? 'Saving…' : 'Save SEO settings' }}
        </Button>
      </div>
    </section>

    <!-- Maintenance -->
    <section id="maintenance" class="bg-card shadow-surface flex scroll-mt-20 flex-col gap-5 rounded-lg border p-5">
      <h3 class="text-subtitle">Maintenance</h3>
      <div class="flex items-start justify-between gap-6">
        <div class="flex flex-col gap-1">
          <p class="text-body">Maintenance mode</p>
          <p class="text-caption text-muted-foreground">
            The public site shows a holding page. The dashboard and the public API keep working.
          </p>
        </div>
        <Switch
          :model-value="form.maintenance_mode"
          aria-label="Maintenance mode"
          @update:model-value="
            (value) => {
              if (value) maintenanceOpen = true
              else form.maintenance_mode = false
            }
          "
        />
      </div>
    </section>

    <AlertDialog :open="maintenanceOpen" @update:open="(open) => (maintenanceOpen = open)">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hide the public site?</AlertDialogTitle>
          <AlertDialogDescription>
            Every public page will show a holding page until maintenance mode is switched off.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            @click="
              () => {
                maintenanceOpen = false
                form.maintenance_mode = true
                save()
              }
            "
          >
            Enable maintenance mode
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
