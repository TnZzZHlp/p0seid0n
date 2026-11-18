<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

const clicks = ref(0)
const loading = ref(false)

async function run(): Promise<void> {
  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 1200))
  loading.value = false
  clicks.value += 1
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Button :loading="loading" @click="run">
      <template #progress>
        <span
          :class="[
            'absolute inset-0 -z-10 origin-left bg-[color-mix(in_oklab,var(--color-surface)_22%,transparent)]',
            loading
              ? 'scale-x-100 transition-transform duration-[1200ms] ease-linear motion-reduce:transition-none'
              : 'scale-x-0',
          ]"
        />
      </template>
      {{ loading ? 'Working' : 'Start' }}
    </Button>
    <Button disabled>Disabled</Button>
    <Button variant="ghost" as="a" href="#states">As a link</Button>
    <span class="text-[13px] text-ink-muted">clicks: {{ clicks }}</span>
  </div>
</template>
