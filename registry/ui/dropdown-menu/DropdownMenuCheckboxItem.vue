<script setup lang="ts">
import { cn } from '@/lib/utils'
import { DropdownMenuCheckboxItem, DropdownMenuItemIndicator } from 'reka-ui'
import { menuItem } from './styles'

defineOptions({ inheritAttrs: false })

export type DropdownMenuCheckboxItemProps = {
  disabled?: boolean
  textValue?: string
}

withDefaults(defineProps<DropdownMenuCheckboxItemProps>(), {
  disabled: false,
  textValue: undefined,
})

const model = defineModel<boolean>({ default: false })
const emit = defineEmits<{ select: [event: Event] }>()
</script>

<template>
  <DropdownMenuCheckboxItem
    v-model="model"
    v-bind="$attrs"
    :disabled="disabled"
    :text-value="textValue"
    :class="cn(menuItem, $attrs.class as string | undefined)"
    @select="emit('select', $event)"
  >
    <DropdownMenuItemIndicator class="flex w-3 shrink-0 text-ink">
      <slot name="indicator">
        <span class="size-1.5 rounded-full bg-ink" />
      </slot>
    </DropdownMenuItemIndicator>
    <slot />
  </DropdownMenuCheckboxItem>
</template>
