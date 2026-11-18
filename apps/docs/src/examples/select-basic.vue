<script setup lang="ts">
import { ref } from 'vue'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const region = ref('eu-central')
const empty = ref<string>()
</script>

<template>
  <div class="grid max-w-sm gap-4">
    <div class="grid gap-1.5">
      <Label for="select-region">Probe region</Label>
      <Select v-model="region">
        <SelectTrigger id="select-region">
          <SelectValue placeholder="Choose a region" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Europe</SelectLabel>
            <SelectItem value="eu-central">Frankfurt (eu-central)</SelectItem>
            <SelectItem value="eu-west">London (eu-west)</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Asia Pacific</SelectLabel>
            <SelectItem value="ap-northeast">Tokyo (ap-northeast)</SelectItem>
            <SelectItem value="ap-southeast" disabled>Singapore (maintenance)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>

    <div class="grid gap-1.5">
      <Label for="select-invalid">Fallback mirror</Label>
      <Select v-model="empty">
        <SelectTrigger id="select-invalid" invalid>
          <SelectValue placeholder="Select a mirror" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="edge-a">Edge A</SelectItem>
          <SelectItem value="edge-b">Edge B</SelectItem>
        </SelectContent>
      </Select>
      <p class="text-[12px] text-danger">Choose a fallback mirror to enable failover.</p>
    </div>
  </div>
</template>
