<script setup lang="ts">
import { achievementFields, achievementBlank } from '~/lib/resource-forms'
import { achievementSchema } from '#shared/schemas/resources'

definePageMeta({ layout: 'admin', title: 'New achievement' })
</script>

<template>
  <ResourceFormPage
    resource="achievement"
    title="New achievement"
    :schema="achievementSchema"
    :fields="achievementFields"
    :blank="achievementBlank"
    redirect-to="/admin/achievement"
  />
</template>
