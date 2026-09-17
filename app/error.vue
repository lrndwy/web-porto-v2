<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isForbidden = computed(() => props.error.statusCode === 403)

const title = computed(() => (isForbidden.value ? 'Not your area' : 'Page not found'))
const description = computed(() =>
  isForbidden.value
    ? 'This page is restricted to the portfolio owner. Sign in with an owner account to continue.'
    : 'That page does not exist, or it moved somewhere else.',
)
</script>

<template>
  <div class="bg-background text-foreground flex min-h-[100dvh] items-center justify-center px-4">
    <Empty class="max-w-md">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon :name="isForbidden ? 'ph:lock' : 'ph:compass'" />
        </EmptyMedia>
        <EmptyTitle class="text-title">{{ title }}</EmptyTitle>
        <EmptyDescription class="text-body">
          {{ description }}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <p class="font-mono text-caption text-muted-foreground">
          {{ error.statusCode }}
        </p>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <Button
            v-if="isForbidden"
            as-child
            class="active:translate-y-px"
          >
            <NuxtLink to="/admin/login">Sign in</NuxtLink>
          </Button>
          <Button
            as-child
            :variant="isForbidden ? 'outline' : 'default'"
            class="active:translate-y-px"
          >
            <NuxtLink to="/">Back home</NuxtLink>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  </div>
</template>
