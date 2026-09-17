<script setup lang="ts">
import { formatNumber } from '#shared/utils/format'
defineProps<{
  rows: { path: string; views: number; visitors: number }[]
}>()
</script>

<template>
  <div v-if="rows.length">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Path</TableHead>
          <TableHead class="text-right font-mono">Views</TableHead>
          <TableHead class="text-right font-mono">Visitors</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="row in rows" :key="row.path">
          <TableCell class="font-mono text-sm">{{ row.path }}</TableCell>
          <TableCell class="text-right font-mono">{{ formatNumber(row.views) }}</TableCell>
          <TableCell class="text-right font-mono">{{ formatNumber(row.visitors) }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
