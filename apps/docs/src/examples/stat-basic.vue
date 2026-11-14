<script setup lang="ts">
import { Stat } from '@/components/ui/stat'
</script>

<template>
  <div class="grid gap-6 sm:grid-cols-2">
    <Stat label="Latency" value="24.3" unit="ms" />
    <Stat label="Jitter" value="2.1" unit="ms" />
    <Stat label="Download" value="140" unit="Mbit/s" tone="accent" />
    <Stat label="Upload" value="38" unit="Mbit/s" tone="accent-alt" />
    <Stat label="Not measured" :value="null" unit="ms" />
    <Stat label="Custom empty" :value="null" empty-text="n/a" />
  </div>
</template>
