<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
</script>

<template>
  <div class="grid gap-4">
    <div class="text-[13px] text-ink-muted">Above</div>
    <Separator />
    <div class="text-[13px] text-ink-muted">Below</div>
    <div class="flex h-10 items-center gap-3 text-[13px] text-ink-muted">
      <span>left</span>
      <Separator orientation="vertical" />
      <span>right</span>
    </div>
  </div>
</template>
