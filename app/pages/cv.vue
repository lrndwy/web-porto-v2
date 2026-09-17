<script setup lang="ts">
const { trackEvent } = useTrackEvent()

useSeo({ title: 'CV' })

// Signed URLs expire after 5 minutes, so they are never taken from the SSR
// payload and the list is re-fetched on every visit.
const { data: documents, pending, refresh } = await useAsyncData(
  'public-documents',
  () => $fetch<PublicDocument[]>('/api/public/documents'),
  { server: false, getCachedData: () => undefined },
)

onMounted(refresh)
</script>

<template>
  <SectionShell id="cv">
    <SectionHeading
      overline="Documents"
      title="Curriculum Vitae"
      description="Download the current PDF. Links are signed and expire shortly after they are issued."
    />

    <div v-if="pending && !documents?.length" class="mt-10 flex flex-col gap-3">
      <Skeleton class="h-14 w-full" />
      <Skeleton class="h-14 w-full" />
    </div>

    <ul v-else-if="documents?.length" class="divide-border mt-10 divide-y">
      <li
        v-for="document in documents"
        :key="document.id"
        class="flex flex-wrap items-center justify-between gap-3 py-4"
      >
        <div class="flex flex-col">
          <p class="text-subtitle">{{ document.name }}</p>
          <p class="text-caption text-muted-foreground font-mono">
            {{ [document.version, document.file_type].filter(Boolean).join(' · ') || 'PDF' }}
          </p>
        </div>
        <Button shape="pill" as-child variant="outline" class="active:translate-y-px">
          <a
            :href="document.url ?? '#'"
            download
            @click="trackEvent('cv_download', { document_id: document.id })"
          >
            <Icon name="ph:download-simple" />
            Download
          </a>
        </Button>
      </li>
    </ul>

    <div v-else class="mt-10">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><Icon name="ph:file-text" /></EmptyMedia>
          <EmptyTitle>No documents yet.</EmptyTitle>
          <EmptyDescription>Upload a PDF in the dashboard to offer it here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  </SectionShell>
</template>
