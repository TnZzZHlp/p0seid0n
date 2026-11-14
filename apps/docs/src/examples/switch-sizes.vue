<script setup lang="ts">
import { ref } from 'vue'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const medium = ref(true)
const large = ref(false)
const off = ref(false)
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <div class="flex items-center gap-2">
      <Label for="switch-md">Medium</Label>
      <Switch id="switch-md" v-model="medium" />
    </div>
    <div class="flex items-center gap-2">
      <Label for="switch-lg">Large</Label>
      <Switch id="switch-lg" v-model="large" size="lg" />
    </div>
    <div class="flex items-center gap-2">
      <Label for="switch-off">Off</Label>
      <Switch id="switch-off" v-model="off" />
    </div>
  </div>
</template>
