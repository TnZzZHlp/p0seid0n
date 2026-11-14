<script setup lang="ts">
import { cn } from '@/lib/utils'
import { TabsTrigger } from 'reka-ui'
import { tabTrigger } from './styles'

defineOptions({ inheritAttrs: false })

export type TabsTriggerProps = {
  value: string | number
  disabled?: boolean
}

withDefaults(defineProps<TabsTriggerProps>(), {
  disabled: false,
})
</script>

<template>
  <TabsTrigger
    :value="value"
    :disabled="disabled"
    :class="cn(tabTrigger, $attrs.class as string | undefined)"
    v-bind="$attrs"
  >
    <slot />
  </TabsTrigger>
</template>
