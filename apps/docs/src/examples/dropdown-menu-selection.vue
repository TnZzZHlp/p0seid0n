<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const showGrid = ref(true)
const showBaseline = ref(false)
const density = ref('comfortable')
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="secondary">View options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" :min-width="180">
        <DropdownMenuLabel>Overlays</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem v-model="showGrid">Show grid</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem v-model="showBaseline">Show baseline</DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Density</DropdownMenuLabel>
        <DropdownMenuRadioGroup v-model="density">
          <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    <span class="text-[13px] text-ink-muted">
      {{ density }}, grid {{ showGrid ? 'on' : 'off' }}, baseline {{ showBaseline ? 'on' : 'off' }}
    </span>
  </div>
</template>
