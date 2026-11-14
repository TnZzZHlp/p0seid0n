<script setup lang="ts">
import { cn } from '@/lib/utils'
import { DropdownMenuSeparator } from 'reka-ui'
import { menuSeparator } from './styles'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <DropdownMenuSeparator :class="cn(menuSeparator, $attrs.class as string | undefined)" />
</template>
