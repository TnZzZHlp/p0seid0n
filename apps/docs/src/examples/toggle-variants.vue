<script setup lang="ts">
import { ref } from 'vue'
import { Toggle } from '@/components/ui/toggle'

const live = ref(true)
const bold = ref(false)
const muted = ref(false)
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <Toggle v-model="live" aria-label="Toggle live stream">
      <svg
        class="size-4"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="2.5" />
        <path d="M4.2 11.8a5.4 5.4 0 0 1 0-7.6" />
        <path d="M11.8 4.2a5.4 5.4 0 0 1 0 7.6" />
      </svg>
      Live ({{ live ? 'on' : 'off' }})
    </Toggle>

    <Toggle v-model="bold" variant="outline" size="sm" aria-label="Toggle pin">Pin</Toggle>
    <Toggle v-model="muted" variant="outline" size="md" aria-label="Toggle alerts">Alerts</Toggle>
    <Toggle variant="outline" size="lg" :default-value="true" disabled aria-label="Locked">
      Locked
    </Toggle>
  </div>
</template>
