<script setup lang="ts">
import { DropdownMenuRoot } from 'reka-ui'

defineOptions({ inheritAttrs: false })

export type DropdownMenuProps = {
  /** Keeps the page scrollable while the menu is open. */
  modal?: boolean
}

withDefaults(defineProps<DropdownMenuProps>(), {
  modal: false,
})

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <DropdownMenuRoot v-model="model" :modal="modal" v-bind="$attrs">
    <slot />
  </DropdownMenuRoot>
</template>
