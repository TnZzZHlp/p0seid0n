<script setup lang="ts">
import { AreaChart } from '@/components/ui/area-chart'

const throughput = [
  { time: '12:00', Download: 118, Upload: 44 },
  { time: '12:05', Download: 142, Upload: 52 },
  { time: '12:10', Download: 136, Upload: 48 },
  { time: '12:15', Download: 168, Upload: 63 },
  { time: '12:20', Download: 154, Upload: 59 },
  { time: '12:25', Download: 184, Upload: 71 },
  { time: '12:30', Download: 176, Upload: 68 },
]

const latency = [24, 21, 29, 18, 22, 34, 25, 19]

function formatMbps(value: number): string {
  return `${value} Mbit/s`
}

function formatMs(value: number): string {
  return `${value} ms`
}
</script>

<template>
  <div class="grid gap-6">
    <div class="rounded-panel border border-line bg-raised p-4">
      <div class="mb-3 text-[13px] font-medium text-ink">Link throughput</div>
      <AreaChart
        :data="throughput"
        :categories="['Download', 'Upload']"
        index="time"
        :value-formatter="formatMbps"
        show-x-axis
        aria-label="Download and upload throughput over time"
      />
    </div>

    <div class="rounded-panel border border-line bg-raised p-4">
      <div class="mb-3 text-[13px] font-medium text-ink">Probe latency (linear)</div>
      <AreaChart
        :values="latency"
        tone="danger"
        curve="linear"
        height="8rem"
        :value-formatter="formatMs"
        aria-label="Probe latency samples"
      />
    </div>
  </div>
</template>
