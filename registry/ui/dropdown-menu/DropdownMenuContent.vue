<script setup lang="ts">
import { cn } from '@/lib/utils'
import { DropdownMenuContent, DropdownMenuPortal } from 'reka-ui'
import { popupSurface } from './styles'

defineOptions({ inheritAttrs: false })

export type DropdownMenuContentProps = {
  align?: 'start' | 'center' | 'end'
  /** Gap between the trigger and the popup, in pixels. */
  sideOffset?: number
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Overrides the 160px minimum width from the reference menu. */
  minWidth?: number | string
}

const props = withDefaults(defineProps<DropdownMenuContentProps>(), {
  align: 'start',
  sideOffset: 8,
  side: 'bottom',
  minWidth: 160,
})

function minWidthStyle(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      v-bind="$attrs"
      :side="props.side"
      :side-offset="props.sideOffset"
      :align="props.align"
      :class="cn(popupSurface, $attrs.class as string | undefined)"
      :style="{ minWidth: minWidthStyle(props.minWidth) }"
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
