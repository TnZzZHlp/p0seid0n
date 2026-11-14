<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

const { toast } = useToast()

function notify(variant: 'default' | 'success' | 'danger'): void {
  toast({
    title: variant === 'danger' ? 'Upload failed' : 'Saved',
    description: variant === 'danger' ? 'The connection dropped.' : 'Changes are on the server.',
    variant,
    action: variant === 'danger' ? { label: 'Retry', onClick: () => notify('success') } : undefined,
  })
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <Button variant="secondary" size="sm" @click="notify('default')">Default</Button>
    <Button variant="secondary" size="sm" @click="notify('success')">Success</Button>
    <Button variant="danger" size="sm" @click="notify('danger')">Danger</Button>
  </div>
</template>
