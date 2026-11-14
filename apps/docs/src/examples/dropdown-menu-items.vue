<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const last = ref('nothing yet')
</script>

<template>
  <div class="flex items-center gap-4">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="secondary">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Session</DropdownMenuLabel>
        <DropdownMenuItem @select="last = 'rename'">Rename</DropdownMenuItem>
        <DropdownMenuItem @select="last = 'duplicate'">Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Archive</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <span class="text-[13px] text-ink-muted">selected: {{ last }}</span>
  </div>
</template>
