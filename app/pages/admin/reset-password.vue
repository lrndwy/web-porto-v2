<script setup lang="ts">
definePageMeta({ layout: 'auth', title: 'Choose a new password' })

const supabase = useSupabaseClient()
const session = useSupabaseSession()

const password = ref('')
const confirm = ref('')
const pending = ref(false)
const formError = ref('')
const done = ref(false)
const recoveryMode = ref(false)

// The module's client plugin exchanges the recovery code and fires
// PASSWORD_RECOVERY; an already-established session also counts, so the page
// still works when the link is opened in a tab that is already signed in.
onMounted(() => {
  if (session.value) recoveryMode.value = true

  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') recoveryMode.value = true
  })

  onUnmounted(() => data.subscription.unsubscribe())
})

async function onSubmit() {
  if (pending.value) return
  formError.value = ''

  if (password.value.length < 8) {
    formError.value = 'Use at least 8 characters.'
    return
  }
  if (password.value !== confirm.value) {
    formError.value = 'Both passwords must match.'
    return
  }

  pending.value = true
  const { error } = await supabase.auth.updateUser({ password: password.value })
  pending.value = false

  if (error) {
    formError.value = error.message
    return
  }
  done.value = true
}
</script>

<template>
  <div v-if="done">
    <p class="text-body measure">Your password has been updated.</p>
    <Button as-child class="mt-6 active:translate-y-px">
      <NuxtLink to="/admin/dashboard">Go to dashboard</NuxtLink>
    </Button>
  </div>

  <p v-else-if="!recoveryMode" class="text-body measure text-muted-foreground">
    Open this page from the reset link in your email. If it expired, request a new one.
  </p>

  <form v-else novalidate @submit.prevent="onSubmit">
    <FieldGroup>
      <Field>
        <FieldLabel for="password">New password</FieldLabel>
        <Input
          id="password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          required
          :disabled="pending"
        />
      </Field>

      <Field>
        <FieldLabel for="confirm">Confirm password</FieldLabel>
        <Input
          id="confirm"
          v-model="confirm"
          type="password"
          autocomplete="new-password"
          required
          :disabled="pending"
        />
      </Field>

      <FieldError v-if="formError">{{ formError }}</FieldError>

      <Button type="submit" class="w-full active:translate-y-px" :disabled="pending">
        {{ pending ? 'Saving…' : 'Update password' }}
      </Button>
    </FieldGroup>
  </form>
</template>
