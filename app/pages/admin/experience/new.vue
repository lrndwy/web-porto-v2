<script setup lang="ts">
import { experienceFields, experienceBlank } from '~/lib/resource-forms'
import { experienceSchema } from '#shared/schemas/resources'

definePageMeta({ layout: 'admin', title: 'New experience' })
</script>

<template>
  <ResourceFormPage
    resource="experience"
    title="New experience"
    :schema="experienceSchema"
    :fields="experienceFields"
    :blank="experienceBlank"
    redirect-to="/admin/experience"
  />
</template>
