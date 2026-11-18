<script setup lang="ts">
import { ref } from 'vue'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const cadence = ref('hourly')
const protocol = ref('https')
</script>

<template>
  <div class="grid gap-6 sm:grid-cols-2">
    <div class="grid gap-2">
      <span class="text-[13px] font-medium text-ink-muted">Sampling cadence</span>
      <RadioGroup v-model="cadence">
        <div class="flex items-center gap-2.5">
          <RadioGroupItem id="rg-minute" value="minute" />
          <Label for="rg-minute" class="text-ink">Every minute</Label>
        </div>
        <div class="flex items-center gap-2.5">
          <RadioGroupItem id="rg-hourly" value="hourly" />
          <Label for="rg-hourly" class="text-ink">Hourly</Label>
        </div>
        <div class="flex items-center gap-2.5">
          <RadioGroupItem id="rg-daily" value="daily" disabled />
          <Label for="rg-daily">Daily (enterprise)</Label>
        </div>
      </RadioGroup>
    </div>

    <div class="grid content-start gap-2">
      <span class="text-[13px] font-medium text-ink-muted">Transport ({{ protocol }})</span>
      <RadioGroup v-model="protocol" orientation="horizontal">
        <div class="flex items-center gap-2">
          <RadioGroupItem id="rg-https" value="https" />
          <Label for="rg-https" class="text-ink">HTTPS</Label>
        </div>
        <div class="flex items-center gap-2">
          <RadioGroupItem id="rg-quic" value="quic" />
          <Label for="rg-quic" class="text-ink">QUIC</Label>
        </div>
      </RadioGroup>
    </div>
  </div>
</template>
