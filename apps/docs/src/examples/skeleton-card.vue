<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <div class="flex max-w-sm items-center gap-4 rounded-panel border border-line bg-raised p-4">
    <Skeleton class="size-11 shrink-0 rounded-full" />
    <div class="grid flex-1 gap-2">
      <Skeleton class="h-4 w-3/4" />
      <Skeleton class="h-3.5 w-1/2" />
    </div>
  </div>
</template>
