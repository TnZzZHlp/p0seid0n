<script setup lang="ts">
import { TooltipProvider, TooltipRoot } from 'reka-ui'

defineOptions({ inheritAttrs: false })

export type TooltipProps = {
  /** Milliseconds the pointer must rest before the tip opens. */
  delay?: number
  disabled?: boolean
}

withDefaults(defineProps<TooltipProps>(), {
  delay: 300,
  disabled: false,
})

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <TooltipProvider :delay-duration="delay" :disabled="disabled">
    <TooltipRoot v-model="model" v-bind="$attrs">
      <slot />
    </TooltipRoot>
  </TooltipProvider>
</template>
