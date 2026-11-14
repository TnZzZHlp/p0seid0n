<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
</script>

<template>
  <div class="grid max-w-sm gap-4">
    <div class="grid gap-1.5">
      <Label for="label-plain">Plain label</Label>
      <Input id="label-plain" placeholder="Type here" />
    </div>
    <div class="grid gap-1.5">
      <Label for="label-req" required>Required label</Label>
      <Input id="label-req" required placeholder="Type here" />
    </div>
  </div>
</template>
