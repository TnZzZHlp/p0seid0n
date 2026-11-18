<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const host = ref('edge.p0seid0n.dev')
const port = ref('443')
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <Popover>
      <PopoverTrigger as-child>
        <Button variant="secondary">Endpoint settings</Button>
      </PopoverTrigger>
      <PopoverContent align="start" class="w-80">
        <div class="grid gap-3">
          <div class="grid gap-0.5">
            <h4 class="text-[14px] font-semibold text-ink">Probe target</h4>
            <p class="text-[12px] text-ink-muted">Update the hostname and port used by manual checks.</p>
          </div>
          <div class="grid gap-1.5">
            <Label for="pop-host">Hostname</Label>
            <Input id="pop-host" v-model="host" />
          </div>
          <div class="grid gap-1.5">
            <Label for="pop-port">Port</Label>
            <Input id="pop-port" v-model="port" />
          </div>
          <div class="flex justify-end">
            <PopoverClose as-child>
              <Button size="sm">Done</Button>
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </Popover>
    <span class="font-mono text-[12px] text-ink-muted">{{ host }}:{{ port }}</span>
  </div>
</template>
