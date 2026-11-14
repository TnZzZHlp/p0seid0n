<script setup lang="ts">
import { cn } from '@/lib/utils'
import { DropdownMenuItem } from 'reka-ui'
import { menuItem } from './styles'

defineOptions({ inheritAttrs: false })

export type DropdownMenuItemProps = {
  disabled?: boolean
  /** Text used for typeahead when the item renders non-text content. */
  textValue?: string
}

withDefaults(defineProps<DropdownMenuItemProps>(), {
  disabled: false,
  textValue: undefined,
})

const emit = defineEmits<{ select: [event: Event] }>()
</script>

<template>
  <DropdownMenuItem
    v-bind="$attrs"
    :disabled="disabled"
    :text-value="textValue"
    :class="cn(menuItem, $attrs.class as string | undefined)"
    @select="emit('select', $event)"
  >
    <slot />
  </DropdownMenuItem>
</template>
