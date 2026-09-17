<script setup lang="ts">
import { documentFields, documentBlank } from '~/lib/resource-forms'
import { documentSchema } from '#shared/schemas/resources'

definePageMeta({ layout: 'admin', title: 'Edit documents' })

const route = useRoute()
</script>

<template>
  <ResourceFormPage
    resource="documents"
    title="Edit documents"
    :schema="documentSchema"
    :fields="documentFields"
    :blank="documentBlank"
    :id="String(route.params.id)"
    redirect-to="/admin/documents"
  />
</template>
