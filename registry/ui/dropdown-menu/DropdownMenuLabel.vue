<script setup lang="ts">
import { cn } from '@/lib/utils'
import { DropdownMenuLabel } from 'reka-ui'
import { menuLabel } from './styles'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <DropdownMenuLabel :class="cn(menuLabel, $attrs.class as string | undefined)">
    <slot />
  </DropdownMenuLabel>
</template>
