<script setup lang="ts">
import { cn } from '@/lib/utils'
import { TabsContent } from 'reka-ui'
import { tabPanel } from './styles'

defineOptions({ inheritAttrs: false })

export type TabsContentProps = {
  value: string | number
  forceMount?: boolean
}

withDefaults(defineProps<TabsContentProps>(), {
  forceMount: false,
})
</script>

<template>
  <TabsContent
    :value="value"
    :force-mount="forceMount"
    :class="cn(tabPanel, $attrs.class as string | undefined)"
    v-bind="$attrs"
  >
    <slot />
  </TabsContent>
</template>
