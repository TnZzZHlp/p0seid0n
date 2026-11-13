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
</script>

<template>
  <div
    v-bind="forwarded"
    :class="
      cn(
        'flex items-start justify-between gap-4 px-6 pt-5 pb-4',
        $attrs.class as string | undefined,
      )
    "
  >
    <div class="flex min-w-0 flex-col gap-1">
      <slot name="title">
        <h3 class="text-[15px] leading-tight font-medium text-ink"><slot /></h3>
      </slot>
      <slot name="description" />
    </div>
    <slot name="action" />
  </div>
</template>
