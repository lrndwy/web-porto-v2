<script setup lang="ts">
import { educationFields, educationBlank } from '~/lib/resource-forms'
import { educationSchema } from '#shared/schemas/resources'

definePageMeta({ layout: 'admin', title: 'New education' })
</script>

<template>
  <ResourceFormPage
    resource="education"
    title="New education"
    :schema="educationSchema"
    :fields="educationFields"
    :blank="educationBlank"
    redirect-to="/admin/education"
  />
</template>
