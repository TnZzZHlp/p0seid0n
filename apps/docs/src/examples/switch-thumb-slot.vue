<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@/components/ui/switch'

const on = ref(true)
</script>

<template>
  <Switch v-model="on" aria-label="Notifications">
    <template #thumb>
      <span v-if="on" aria-hidden="true" class="text-[10px] leading-none">on</span>
      <span v-else aria-hidden="true" class="text-[10px] leading-none">off</span>
    </template>
  </Switch>
</template>
