<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Button variant="secondary">
      <template #leading><span aria-hidden="true">+</span></template>
      With leading
    </Button>
    <Button variant="ghost">
      With trailing
      <template #trailing><span aria-hidden="true">&#8594;</span></template>
    </Button>
  </div>
</template>
