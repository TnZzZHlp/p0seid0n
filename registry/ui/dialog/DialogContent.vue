<script setup lang="ts">
import { cn } from '@/lib/utils'
import { DialogClose, DialogContent, DialogOverlay, DialogPortal } from 'reka-ui'
import type { PointerDownOutsideEvent } from 'reka-ui'
import { useDialogBehaviour } from './behaviour'
import { closeButton } from './styles'

defineOptions({ inheritAttrs: false })

export type DialogContentProps = {
  /** Hides the built-in close button when the panel supplies its own. */
  hideClose?: boolean
}

withDefaults(defineProps<DialogContentProps>(), {
  hideClose: false,
})

const behaviour = useDialogBehaviour()

const emit = defineEmits<{
  escapeKeyDown: [event: KeyboardEvent]
  pointerDownOutside: [event: PointerDownOutsideEvent]
  interactOutside: [event: Event]
}>()

function onEscapeKeyDown(event: KeyboardEvent): void {
  if (!behaviour.closeOnEsc.value) event.preventDefault()
  emit('escapeKeyDown', event)
}

function onPointerDownOutside(event: PointerDownOutsideEvent): void {
  if (!behaviour.closeOnOutside.value) event.preventDefault()
  emit('pointerDownOutside', event)
}

function onInteractOutside(event: Event): void {
  emit('interactOutside', event)
}
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      class="fixed inset-0 z-40 bg-[color-mix(in_oklab,var(--color-ink)_45%,transparent)]"
    />
    <DialogContent
      v-bind="$attrs"
      aria-modal="true"
      :class="
        cn(
          'fixed left-1/2 top-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2',
          'rounded-panel border border-line bg-raised p-6 shadow-popup outline-none',
          $attrs.class as string | undefined,
        )
      "
      @escape-key-down="onEscapeKeyDown"
      @pointer-down-outside="onPointerDownOutside"
      @interact-outside="onInteractOutside"
    >
      <slot />
      <DialogClose v-if="!hideClose" aria-label="Close" :class="closeButton">
        <span aria-hidden="true">&#215;</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
