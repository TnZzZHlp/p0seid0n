<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const name = ref('Ada')
const bad = ref('not-an-email')
const locked = ref('read only')
</script>

<template>
  <div class="grid max-w-sm gap-4">
    <div class="grid gap-1.5">
      <Label for="demo-name" required>Name</Label>
      <Input id="demo-name" v-model="name" placeholder="Your name" />
    </div>
    <div class="grid gap-1.5">
      <Label for="demo-invalid">Email</Label>
      <Input id="demo-invalid" v-model="bad" invalid />
      <p class="text-[12px] text-danger">Enter a valid address.</p>
    </div>
    <div class="grid gap-1.5">
      <Label for="demo-locked">Locked</Label>
      <Input id="demo-locked" v-model="locked" disabled />
    </div>
  </div>
</template>
