<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

const completion = ref(64)

function step(): void {
  completion.value = completion.value >= 100 ? 12 : Math.min(100, completion.value + 18)
}
</script>

<template>
  <div class="grid max-w-md gap-4">
    <div class="grid gap-1.5">
      <div class="flex items-center justify-between text-[12px] text-ink-muted">
        <span>Upload progress</span>
        <span class="font-condensed text-[14px] font-medium tabular-nums text-ink">
          {{ completion }}%
        </span>
      </div>
      <Progress :model-value="completion" aria-label="Upload progress" />
    </div>

    <div class="grid gap-1.5">
      <span class="text-[12px] text-ink-muted">Accent tone</span>
      <Progress :model-value="82" tone="accent" aria-label="Link utilisation" />
    </div>

    <div class="grid gap-1.5">
      <span class="text-[12px] text-ink-muted">Danger tone</span>
      <Progress :model-value="91" tone="danger" aria-label="Quota usage" />
    </div>

    <div class="grid gap-1.5">
      <span class="text-[12px] text-ink-muted">Indeterminate</span>
      <Progress aria-label="Connecting to probe" />
    </div>

    <div>
      <Button size="sm" variant="secondary" @click="step">Advance</Button>
    </div>
  </div>
</template>
