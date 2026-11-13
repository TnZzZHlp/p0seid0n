<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { Component } from 'vue'
import { cn } from '@/lib/utils'
import { buttonVariants } from './variants'
import type { ButtonSize, ButtonVariant } from './variants'

defineOptions({ inheritAttrs: false })

export type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Rendered element or component. Links pass as: 'a'. */
  as?: string | Component
  /** Native button type; ignored when `as` is not a button. */
  type?: 'button' | 'submit' | 'reset'
  /** Disables interaction and marks the button as busy. */
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  as: 'button',
  type: 'button',
  loading: false,
  disabled: false,
})

const attrs = useAttrs()

// The click listener is attached by this component so that `loading` and
// `disabled` also block it for non-button roots such as links.
const forwarded = computed(() => {
  const rest = { ...attrs }
  delete rest.class
  delete rest.onClick
  return rest
})

const isNativeButton = computed(() => props.as === 'button')
const isInert = computed(() => props.disabled || props.loading)

function onClick(event: MouseEvent): void {
  if (isInert.value) {
    event.preventDefault()
    return
  }
  ;(attrs.onClick as ((event: MouseEvent) => void) | undefined)?.(event)
}
</script>

<template>
  <component
    :is="as"
    v-bind="forwarded"
    :type="isNativeButton ? type : undefined"
    :class="cn(buttonVariants({ variant, size }), $attrs.class as string | undefined)"
    :disabled="isNativeButton ? isInert : undefined"
    :aria-disabled="isInert ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    @click="onClick"
  >
    <slot name="progress" />
    <slot name="leading" />
    <slot />
    <slot name="trailing" />
  </component>
</template>
