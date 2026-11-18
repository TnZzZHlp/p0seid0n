<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'

const lastAction = ref('None')
const dialogOpen = ref(false)

function run(action: string): void {
  lastAction.value = action
  dialogOpen.value = false
}
</script>

<template>
  <div class="grid max-w-lg gap-4">
    <Command>
      <CommandInput placeholder="Filter probes or actions..." />
      <CommandList>
        <CommandEmpty>No matching commands.</CommandEmpty>
        <CommandGroup heading="Probes">
          <CommandItem
            value="Run latency check"
            :keywords="['ping', 'rtt']"
            @select="run('Run latency check')"
          >
            Run latency check
            <CommandShortcut>R</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="Switch to Frankfurt node"
            :keywords="['fra', 'europe']"
            @select="run('Switch to Frankfurt node')"
          >
            Switch to Frankfurt node
            <CommandShortcut>F</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Workspace">
          <CommandItem value="Export CSV snapshot" @select="run('Export CSV snapshot')">
            Export CSV snapshot
            <CommandShortcut>E</CommandShortcut>
          </CommandItem>
          <CommandItem value="Clear cached routes" disabled @select="run('Clear cached routes')">
            Clear cached routes
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <Button size="sm" variant="secondary" @click="dialogOpen = true">Open command dialog</Button>
      <span class="text-[12px] text-ink-muted">Last action: {{ lastAction }}</span>
    </div>

    <CommandDialog v-model:open="dialogOpen">
      <CommandInput placeholder="Type a command..." auto-focus />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Quick actions">
          <CommandItem value="Toggle dark theme" @select="run('Toggle dark theme')">
            Toggle dark theme
            <CommandShortcut>T</CommandShortcut>
          </CommandItem>
          <CommandItem value="Inspect motion tokens" @select="run('Inspect motion tokens')">
            Inspect motion tokens
            <CommandShortcut>M</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  </div>
</template>
