<script setup lang="ts">
import { Sparkline } from '@/components/ui/sparkline'
</script>

<template>
  <div class="grid max-w-sm gap-4 text-[26px]">
    <div>
      <Sparkline :values="[]" baseline />
      <p class="mt-1 font-sans text-[12px] text-ink-muted">empty: no path, size kept</p>
    </div>
    <div>
      <Sparkline :values="[42]" baseline />
      <p class="mt-1 font-sans text-[12px] text-ink-muted">single sample: one bar</p>
    </div>
    <div>
      <Sparkline :values="[0, 0, 0, 0]" baseline />
      <p class="mt-1 font-sans text-[12px] text-ink-muted">all zero: flat</p>
    </div>
  </div>
</template>
