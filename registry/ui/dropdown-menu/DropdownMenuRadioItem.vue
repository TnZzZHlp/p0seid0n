<script setup lang="ts">
import { cn } from '@/lib/utils'
import { DropdownMenuItemIndicator, DropdownMenuRadioItem } from 'reka-ui'
import { menuItem } from './styles'

defineOptions({ inheritAttrs: false })

export type DropdownMenuRadioItemProps = {
  value: string
  disabled?: boolean
  textValue?: string
}

withDefaults(defineProps<DropdownMenuRadioItemProps>(), {
  disabled: false,
  textValue: undefined,
})

const emit = defineEmits<{ select: [event: Event] }>()
</script>

<template>
  <DropdownMenuRadioItem
    v-bind="$attrs"
    :value="value"
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
  </DropdownMenuRadioItem>
</template>
