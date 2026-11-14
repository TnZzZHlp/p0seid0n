<script setup lang="ts">
import { cn } from '@/lib/utils'
import { TooltipContent, TooltipPortal } from 'reka-ui'

defineOptions({ inheritAttrs: false })

export type TooltipContentProps = {
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  /** Keyboard shortcut hint appended after the label. */
  shortcut?: string
}

withDefaults(defineProps<TooltipContentProps>(), {
  side: 'top',
  align: 'center',
  sideOffset: 6,
  shortcut: undefined,
})
</script>

<template>
  <TooltipPortal>
    <TooltipContent
      v-bind="$attrs"
      :side="side"
      :align="align"
      :side-offset="sideOffset"
      :class="
        cn(
          'z-10 flex items-center gap-2 rounded-[10px] border border-line bg-raised px-2.5 py-1.5',
          'text-[12px] font-medium text-ink shadow-popup',
          $attrs.class as string | undefined,
        )
      "
    >
      <slot />
      <kbd
        v-if="shortcut"
        class="rounded-[6px] border border-line px-1.5 py-0.5 font-sans text-[11px] text-ink-muted"
        >{{ shortcut }}</kbd
      >
    </TooltipContent>
  </TooltipPortal>
</template>
