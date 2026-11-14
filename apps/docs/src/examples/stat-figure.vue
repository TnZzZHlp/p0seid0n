<script setup lang="ts">
import { Sparkline } from '@/components/ui/sparkline'
import { Stat } from '@/components/ui/stat'

const latency = [12, 15, 11, 18, 14, 33, 16, 13]
const throughput = [40, 52, 61, 58, 70, 66, 82, 90]
</script>

<template>
  <div class="grid max-w-sm gap-6">
    <Stat label="Latency" value="16" unit="ms">
      <template #figure><Sparkline :values="latency" class="ml-3" /></template>
    </Stat>
    <Stat label="Download" value="90" unit="Mbit/s" tone="accent">
      <template #figure><Sparkline :values="throughput" tone="accent" class="ml-3" /></template>
    </Stat>
  </div>
</template>
