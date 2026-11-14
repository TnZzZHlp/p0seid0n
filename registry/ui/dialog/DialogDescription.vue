<script setup lang="ts">
import { cn } from '@/lib/utils'
import { DialogDescription } from 'reka-ui'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <DialogDescription
    :class="cn('mt-2 text-[14px] text-ink-muted', $attrs.class as string | undefined)"
  >
    <slot />
  </DialogDescription>
</template>
