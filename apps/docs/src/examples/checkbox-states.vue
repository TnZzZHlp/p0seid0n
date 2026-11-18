<script setup lang="ts">
import { ref } from 'vue'
import type { CheckboxCheckedState } from 'reka-ui'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const telemetry = ref<CheckboxCheckedState>(true)
const alerts = ref<CheckboxCheckedState>(false)
const mixed = ref<CheckboxCheckedState>('indeterminate')
const agreed = ref<CheckboxCheckedState>(false)

function cycleMixed(): void {
  mixed.value = mixed.value === 'indeterminate' ? true : mixed.value === true ? false : 'indeterminate'
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex items-center gap-2.5">
      <Checkbox id="cb-telemetry" v-model="telemetry" />
      <Label for="cb-telemetry" class="text-ink">Record per-probe latency samples</Label>
    </div>
    <div class="flex items-center gap-2.5">
      <Checkbox id="cb-alerts" v-model="alerts" />
      <Label for="cb-alerts" class="text-ink">Notify when packet loss exceeds 2%</Label>
    </div>
    <div class="flex items-center gap-2.5">
      <Checkbox id="cb-mixed" v-model="mixed" />
      <Label for="cb-mixed" class="text-ink">Select all regions ({{ mixed }})</Label>
      <Button size="sm" variant="ghost" @click="cycleMixed">Cycle</Button>
    </div>
    <div class="flex items-center gap-2.5">
      <Checkbox id="cb-invalid" v-model="agreed" invalid />
      <Label for="cb-invalid" required class="text-danger">Accept measurement terms</Label>
    </div>
    <div class="flex items-center gap-2.5">
      <Checkbox id="cb-disabled" :default-value="true" disabled />
      <Label for="cb-disabled">Managed by organisation policy</Label>
    </div>
  </div>
</template>
