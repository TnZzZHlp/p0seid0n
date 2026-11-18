<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { ClassValue } from 'clsx'
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

const attrs = useAttrs()
const forwarded = computed(() => {
  const rest = { ...attrs }
  delete rest.class
  return rest
})
</script>

<template>
  <TabsList v-bind="forwarded" :loop="loop" :class="cn(tabList, attrs.class as ClassValue)">
    <slot />
  </TabsList>
</template>
