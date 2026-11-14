<script setup lang="ts">
import { Sparkline } from '@/components/ui/sparkline'

const steady = [12, 13, 12, 14, 13, 12, 13, 12]
const shaky = [10, 22, 8, 30, 11, 26, 9, 24]
const spike = [12, 12, 13, 12, 90, 12, 12, 13]
</script>

<template>
  <div class="grid max-w-sm gap-4 text-[26px]">
    <div>
      <Sparkline :values="steady" baseline />
      <p class="mt-1 font-sans text-[12px] text-ink-muted">steady, with a baseline</p>
    </div>
    <div>
      <Sparkline :values="shaky" tone="accent" />
      <p class="mt-1 font-sans text-[12px] text-ink-muted">shaky, accent tone</p>
    </div>
    <div>
      <Sparkline :values="spike" tone="accent-alt" />
      <p class="mt-1 font-sans text-[12px] text-ink-muted">
        one spike, capped at three times the median
      </p>
    </div>
  </div>
</template>
