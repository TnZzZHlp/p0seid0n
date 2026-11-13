<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const forwarded = computed(() => {
  const rest = { ...attrs }
  delete rest.class
  return rest
})

export type CardProps = {
  /** raised sits on the page surface; surface sits on a raised panel. */
  appearance?: 'raised' | 'surface'
}

const props = withDefaults(defineProps<CardProps>(), {
  appearance: 'raised',
})

const appearanceClass = computed(() =>
  props.appearance === 'surface' ? 'bg-surface' : 'bg-raised',
)
</script>

<template>
  <div
    v-bind="forwarded"
    :class="
      cn('flex flex-col rounded-panel border', appearanceClass, $attrs.class as string | undefined)
    "
  >
    <slot />
  </div>
</template>
