<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
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
const status = useTemplateRef<HTMLElement>('status')
let focusStatusOnClose = false

function confirmDelete() {
  confirmed.value = true
  focusStatusOnClose = true
  open.value = false
}

function finalFocus() {
  if (!focusStatusOnClose) return undefined
  focusStatusOnClose = false
  return status.value
}
</script>

<template>
  <div class="flex items-center gap-4">
    <Dialog v-model:open="open">
      <DialogTrigger as-child>
        <Button variant="danger">Delete project</Button>
      </DialogTrigger>
      <DialogContent :final-focus="finalFocus">
        <DialogTitle>Delete this project?</DialogTitle>
        <DialogDescription>The project and its history are removed for good.</DialogDescription>
        <div class="mt-5 flex justify-end gap-2">
          <DialogClose as-child>
            <Button variant="ghost" size="sm">Cancel</Button>
          </DialogClose>
          <Button variant="danger" size="sm" @click="confirmDelete">Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
    <span ref="status" tabindex="-1" class="text-[13px] text-ink-muted">
      {{ confirmed ? 'deleted' : 'not deleted' }}
    </span>
  </div>
</template>
