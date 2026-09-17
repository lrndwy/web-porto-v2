<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', title: 'Settings' })

const supabase = useSupabaseClient()
const owner = useOwner()

const displayName = ref(owner.value?.displayName ?? '')
const avatarUrl = ref<string | null>(null)
const savingProfile = ref(false)

const password = ref('')
const confirm = ref('')
const savingPassword = ref(false)
const signingOutEverywhere = ref(false)

async function loadProfile() {
  const { data } = await useSupabaseClient()
    .from('user_profiles')
    .select('display_name, avatar_url')
    .eq('id', owner.value?.userId ?? '')
    .maybeSingle()

  if (data) {
    displayName.value = data.display_name ?? ''
    avatarUrl.value = data.avatar_url
  }
}

onMounted(loadProfile)

async function saveProfile() {
  savingProfile.value = true
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ display_name: displayName.value.trim(), avatar_url: avatarUrl.value })
      .eq('id', owner.value?.userId ?? '')

    if (error) throw error
    if (owner.value) owner.value.displayName = displayName.value.trim()
    toast.success('Account updated.')
  } catch (error) {
    toast.error(errorMessage(error, 'Could not update the account.'))
  } finally {
    savingProfile.value = false
  }
}

async function changePassword() {
  if (password.value.length < 8) {
    toast.error('Use at least 8 characters.')
    return
  }
  if (password.value !== confirm.value) {
    toast.error('Both passwords must match.')
    return
  }

  savingPassword.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: password.value })
    if (error) throw error
    password.value = ''
    confirm.value = ''
    toast.success('Password updated.')
  } catch (error) {
    toast.error(errorMessage(error, 'Could not update the password.'))
  } finally {
    savingPassword.value = false
  }
}

async function signOutEverywhere() {
  signingOutEverywhere.value = true
  try {
    await supabase.auth.signOut({ scope: 'global' })
  } catch {
    // Even a failed round-trip should not trap the owner here.
  } finally {
    signingOutEverywhere.value = false
    owner.value = null
    await navigateTo('/admin/login')
  }
}
</script>

<template>
  <div class="flex flex-col gap-10">
    <header class="flex flex-col gap-1">
      <h2 class="text-title">Settings</h2>
      <p class="text-caption text-muted-foreground">Your account and security controls.</p>
    </header>

    <section id="account" class="bg-card shadow-surface flex scroll-mt-20 flex-col gap-5 rounded-lg border p-5">
      <h3 class="text-subtitle">Account</h3>

      <div class="grid gap-5 md:grid-cols-2">
        <Field>
          <FieldLabel for="display-name">Display name</FieldLabel>
          <Input id="display-name" v-model="displayName" />
        </Field>

        <Field>
          <FieldLabel>Avatar</FieldLabel>
          <ImageUploadField v-model="avatarUrl" bucket="avatars" />
        </Field>
      </div>

      <Field>
        <FieldLabel for="account-email">Email</FieldLabel>
        <Input id="account-email" :model-value="''" disabled placeholder="Read-only" />
        <FieldDescription>
          The sign-in email is managed in Supabase Auth, not here.
        </FieldDescription>
      </Field>

      <div>
        <Button class="active:translate-y-px" :disabled="savingProfile" @click="saveProfile">
          {{ savingProfile ? 'Saving…' : 'Save account' }}
        </Button>
      </div>
    </section>

    <section id="security" class="bg-card shadow-surface flex scroll-mt-20 flex-col gap-5 rounded-lg border p-5">
      <h3 class="text-subtitle">Security</h3>

      <div class="grid gap-5 md:grid-cols-2">
        <Field>
          <FieldLabel for="new-password">New password</FieldLabel>
          <Input id="new-password" v-model="password" type="password" autocomplete="new-password" />
        </Field>
        <Field>
          <FieldLabel for="confirm-password">Confirm password</FieldLabel>
          <Input id="confirm-password" v-model="confirm" type="password" autocomplete="new-password" />
        </Field>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <Button class="active:translate-y-px" :disabled="savingPassword" @click="changePassword">
          {{ savingPassword ? 'Updating…' : 'Change password' }}
        </Button>
        <Button variant="outline" :disabled="signingOutEverywhere" @click="signOutEverywhere">
          <Icon name="ph:sign-out" />
          Sign out everywhere
        </Button>
      </div>
    </section>
  </div>
</template>
