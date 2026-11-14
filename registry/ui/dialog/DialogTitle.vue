<script setup lang="ts">
import { cn } from '@/lib/utils'
import { DialogTitle } from 'reka-ui'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <DialogTitle :class="cn('text-[17px] font-medium text-ink', $attrs.class as string | undefined)">
    <slot />
  </DialogTitle>
</template>
