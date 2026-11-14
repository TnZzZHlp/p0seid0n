<script setup lang="ts">
import { DialogRoot } from 'reka-ui'
import { provideDialogBehaviour } from './behaviour'

defineOptions({ inheritAttrs: false })

export type DialogProps = {
  /** Closes when the pointer goes down outside the panel. */
  closeOnOutside?: boolean
  closeOnEsc?: boolean
}

const props = withDefaults(defineProps<DialogProps>(), {
  closeOnOutside: true,
  closeOnEsc: true,
})

// Passed as thunks rather than as props so the flags are read at event time.
provideDialogBehaviour({
  closeOnOutside: () => props.closeOnOutside,
  closeOnEsc: () => props.closeOnEsc,
})

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <DialogRoot v-model="model" modal v-bind="$attrs">
    <slot />
  </DialogRoot>
</template>
