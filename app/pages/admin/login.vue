<script setup lang="ts">
definePageMeta({ layout: 'auth', title: 'Sign in' })

const supabase = useSupabaseClient()
const router = useRouter()
const redirect = useSupabaseCookieRedirect()

const email = ref('')
const password = ref('')
const pending = ref(false)
const formError = ref('')

async function onSubmit() {
  if (pending.value) return
  pending.value = true
  formError.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value,
  })

  pending.value = false

  if (error) {
    formError.value = error.message
    return
  }

  await router.push(redirect.pluck() || '/admin/dashboard')
}
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
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
      </Field>

      <Field>
        <FieldLabel for="password">Password</FieldLabel>
        <Input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
          :disabled="pending"
        />
      </Field>

      <FieldError v-if="formError">{{ formError }}</FieldError>

      <Button type="submit" class="w-full active:translate-y-px" :disabled="pending">
        {{ pending ? 'Signing in…' : 'Sign in' }}
      </Button>
    </FieldGroup>

    <NuxtLink
      to="/admin/forgot-password"
      class="text-caption text-muted-foreground hover:text-foreground mt-6 inline-block transition-colors duration-200"
    >
      Forgot your password?
    </NuxtLink>
  </form>
</template>
