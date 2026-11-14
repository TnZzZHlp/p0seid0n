<script setup lang="ts">
import Toast from './Toast.vue'
import { useToastStack } from './stack'
import { toastViewport } from './styles'

const stack = useToastStack()
</script>

<template>
  <div :class="toastViewport" role="region" aria-label="Notifications">
    <Toast
      v-for="record in stack.items.value"
      :key="record.id"
      :record="record"
      @dismiss="stack.dismiss"
    />
  </div>
</template>
