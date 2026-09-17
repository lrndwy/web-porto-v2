<script setup lang="ts">
definePageMeta({ layout: 'auth', title: 'Reset your password' })

const supabase = useSupabaseClient()
const siteUrl = useRuntimeConfig().public.siteUrl

const email = ref('')
const pending = ref(false)
const formError = ref('')
const sent = ref(false)

async function onSubmit() {
  if (pending.value) return
  pending.value = true
  formError.value = ''

  const { error } = await supabase.auth.resetPasswordForEmail(email.value.trim(), {
    redirectTo: `${siteUrl}/admin/reset-password`,
  })

  pending.value = false

  if (error) {
    formError.value = error.message
    return
  }
  sent.value = true
}
</script>

<template>
  <div v-if="sent">
    <p class="text-body measure">
      If an owner account exists for that address, a reset link is on its way.
    </p>
    <Button as-child variant="outline" class="mt-6 active:translate-y-px">
      <NuxtLink to="/admin/login">Back to sign in</NuxtLink>
    </Button>
  </div>

  <form v-else novalidate @submit.prevent="onSubmit">
    <FieldGroup>
      <Field>
        <FieldLabel for="email">Email</FieldLabel>
        <Input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          required
          :disabled="pending"
        />
        <FieldDescription>We send a single-use link to this address.</FieldDescription>
      </Field>

      <FieldError v-if="formError">{{ formError }}</FieldError>

      <Button type="submit" class="w-full active:translate-y-px" :disabled="pending">
        {{ pending ? 'Sending…' : 'Send reset link' }}
      </Button>
    </FieldGroup>
  </form>
</template>
