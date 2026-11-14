<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const open = ref(false)
const confirmed = ref(false)
</script>

<template>
  <div class="flex items-center gap-4">
    <Dialog v-model:open="open">
      <DialogTrigger as-child>
        <Button variant="danger">Delete project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete this project?</DialogTitle>
        <DialogDescription>The project and its history are removed for good.</DialogDescription>
        <div class="mt-5 flex justify-end gap-2">
          <DialogClose as-child>
            <Button variant="ghost" size="sm">Cancel</Button>
          </DialogClose>
          <Button variant="danger" size="sm" @click="confirmed = true; open = false">Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
    <span class="text-[13px] text-ink-muted">{{ confirmed ? 'deleted' : 'not deleted' }}</span>
  </div>
</template>
