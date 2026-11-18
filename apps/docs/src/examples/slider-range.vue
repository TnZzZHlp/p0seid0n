<script setup lang="ts">
import { ref } from 'vue'
import { Slider } from '@/components/ui/slider'

const threshold = ref([65])
const windowRange = ref([20, 80])
</script>

<template>
  <div class="grid max-w-md gap-6">
    <div class="grid gap-2.5">
      <div class="flex items-baseline justify-between">
        <span class="text-[13px] font-medium text-ink-muted">Latency budget</span>
        <span class="font-condensed text-[18px] font-medium tracking-[-0.01em] tabular-nums text-ink">
          {{ threshold[0] }} ms
        </span>
      </div>
      <Slider v-model="threshold" :min="10" :max="200" :step="5" aria-label="Latency budget" />
    </div>

    <div class="grid gap-2.5">
      <div class="flex items-baseline justify-between">
        <span class="text-[13px] font-medium text-ink-muted">Percentile window</span>
        <span class="font-condensed text-[18px] font-medium tracking-[-0.01em] tabular-nums text-ink">
          p{{ windowRange[0] }} - p{{ windowRange[1] }}
        </span>
      </div>
      <Slider
        v-model="windowRange"
        :min="0"
        :max="100"
        :step="5"
        :min-steps-between-thumbs="2"
        :thumb-labels="['Minimum percentile', 'Maximum percentile']"
      />
    </div>
  </div>
</template>
