<script setup lang="ts">
import { experienceFields, experienceBlank } from '~/lib/resource-forms'
import { experienceSchema } from '#shared/schemas/resources'

definePageMeta({ layout: 'admin', title: 'Edit experience' })

const route = useRoute()
</script>

<template>
  <ResourceFormPage
    resource="experience"
    title="Edit experience"
    :schema="experienceSchema"
    :fields="experienceFields"
    :blank="experienceBlank"
    :id="String(route.params.id)"
    redirect-to="/admin/experience"
  />
</template>
