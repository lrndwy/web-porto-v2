<script setup lang="ts">
import { achievementFields, achievementBlank } from '~/lib/resource-forms'
import { achievementSchema } from '#shared/schemas/resources'

definePageMeta({ layout: 'admin', title: 'Edit achievement' })

const route = useRoute()
</script>

<template>
  <ResourceFormPage
    resource="achievement"
    title="Edit achievement"
    :schema="achievementSchema"
    :fields="achievementFields"
    :blank="achievementBlank"
    :id="String(route.params.id)"
    redirect-to="/admin/achievement"
  />
</template>
