<script setup lang="ts">
import { documentFields, documentBlank } from '~/lib/resource-forms'
import { documentSchema } from '#shared/schemas/resources'

definePageMeta({ layout: 'admin', title: 'New documents' })
</script>

<template>
  <ResourceFormPage
    resource="documents"
    title="New documents"
    :schema="documentSchema"
    :fields="documentFields"
    :blank="documentBlank"
    redirect-to="/admin/documents"
  />
</template>
