<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const forwarded = computed(() => {
  const rest = { ...attrs }
  delete rest.class
  return rest
})

export type LabelProps = {
  /** Id of the control this label describes; rendered as the `for` attribute. */
  for?: string
  /** Appends a decorative required marker. */
  required?: boolean
}

withDefaults(defineProps<LabelProps>(), {
  for: undefined,
  required: false,
})
</script>

<template>
  <label
    v-bind="forwarded"
    :for="$props.for"
    :class="
      cn(
        'inline-flex items-center gap-1 text-[13px] font-medium text-ink-muted',
        $attrs.class as string | undefined,
      )
    "
  >
    <slot />
    <span v-if="required" aria-hidden="true" class="text-danger">*</span>
  </label>
</template>
