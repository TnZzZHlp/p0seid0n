<script setup lang="ts">
import { ref } from 'vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

const status = ref('idle')
</script>

<template>
  <div class="flex items-center gap-4">
    <AlertDialog>
      <AlertDialogTrigger as-child>
        <Button variant="danger">Revoke token</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke this API token?</AlertDialogTitle>
          <AlertDialogDescription>
            Automated probes using this credential will fail immediately. You cannot undo this action.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="sm" @click="status = 'cancelled'">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="danger" size="sm" @click="status = 'revoked'">
            Revoke token
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <span class="text-[13px] text-ink-muted">Status: {{ status }}</span>
  </div>
</template>
