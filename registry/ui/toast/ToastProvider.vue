<script setup lang="ts">
import { computed, provide } from 'vue'
import { toastKey, type ToastApi, type ToastOptions } from './context'
import { createToastStack, provideToastStack } from './stack'
import Toaster from './Toaster.vue'

export type ToastProviderProps = {
  /** Milliseconds a notification stays open, overridable per call. */
  duration?: number
  /** Oldest notifications beyond this count are dropped immediately. */
  max?: number
}

const props = withDefaults(defineProps<ToastProviderProps>(), {
  duration: 4000,
  max: 3,
})

const stack = createToastStack()
provideToastStack(stack)

function toast(options: ToastOptions): string {
  return stack.push(options, props.duration, props.max)
}

const api = computed<ToastApi>(() => ({
  toast,
  dismiss: stack.dismiss,
  dismissAll: stack.dismissAll,
}))
provide(toastKey, api.value)

defineExpose({ toast, dismiss: stack.dismiss, dismissAll: stack.dismissAll })
</script>

<template>
  <slot />
  <Toaster />
</template>
