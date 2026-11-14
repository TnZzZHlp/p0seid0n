<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

const { toast, dismissAll } = useToast()

function burst(): void {
  for (let index = 1; index <= 5; index += 1) {
    toast({ title: `Notification ${index}`, duration: 6000 })
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Button size="sm" @click="burst">Fire five</Button>
    <Button size="sm" variant="ghost" @click="dismissAll">Clear all</Button>
    <span class="text-[13px] text-ink-muted">At most three stay on screen; the oldest drops first.</span>
  </div>
</template>
