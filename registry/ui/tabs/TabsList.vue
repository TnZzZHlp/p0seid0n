<script setup lang="ts">
import { cn } from '@/lib/utils'
import { TabsList } from 'reka-ui'
import { tabList } from './styles'

defineOptions({ inheritAttrs: false })

export type TabsListProps = {
  /** Wraps focus from the last trigger to the first. */
  loop?: boolean
}

withDefaults(defineProps<TabsListProps>(), {
  loop: true,
})
</script>

<template>
  <TabsList :loop="loop" :class="cn(tabList, $attrs.class as string | undefined)" v-bind="$attrs">
    <slot />
  </TabsList>
</template>
