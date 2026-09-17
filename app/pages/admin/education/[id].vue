<script setup lang="ts">
import { educationFields, educationBlank } from '~/lib/resource-forms'
import { educationSchema } from '#shared/schemas/resources'

definePageMeta({ layout: 'admin', title: 'Edit education' })

const route = useRoute()
</script>

<template>
  <ResourceFormPage
    resource="education"
    title="Edit education"
    :schema="educationSchema"
    :fields="educationFields"
    :blank="educationBlank"
    :id="String(route.params.id)"
    redirect-to="/admin/education"
  />
</template>
