<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { cn } from '@/lib/utils'
import type { ToastRecord } from './context'
import {
  toastAccent,
  toastAction,
  toastActions,
  toastCard,
  toastDescription,
  toastDismiss,
  toastTitle,
} from './styles'

const props = defineProps<{ record: ToastRecord }>()
const emit = defineEmits<{ dismiss: [id: string] }>()

let timer: ReturnType<typeof setTimeout> | undefined

function clearTimer(): void {
  if (timer !== undefined) {
    clearTimeout(timer)
    timer = undefined
  }
}

function armTimer(): void {
  clearTimer()
  // A zero duration means the notification stays until dismissed by hand.
  if (props.record.duration > 0) {
    timer = setTimeout(() => emit('dismiss', props.record.id), props.record.duration)
  }
}

onMounted(armTimer)
// Re-arming on duration change keeps the countdown honest if a record is replaced.
watch(() => props.record.duration, armTimer)
onBeforeUnmount(clearTimer)

function runAction(): void {
  props.record.action?.onClick?.()
  emit('dismiss', props.record.id)
}
</script>

<template>
  <div
    :class="cn(toastCard, 'relative overflow-hidden pl-5')"
    role="status"
    aria-live="polite"
    :data-toast-id="record.id"
  >
    <span :class="toastAccent(record.variant)" aria-hidden="true" />
    <div class="min-w-0 flex-1">
      <p :class="toastTitle">{{ record.title }}</p>
      <p v-if="record.description" :class="toastDescription">{{ record.description }}</p>
      <div v-if="record.action" :class="toastActions">
        <button type="button" :class="toastAction" @click="runAction">
          {{ record.action.label }}
        </button>
      </div>
    </div>
    <button
      type="button"
      aria-label="Dismiss notification"
      :class="toastDismiss"
      @click="emit('dismiss', record.id)"
    >
      <span aria-hidden="true">&#215;</span>
    </button>
  </div>
</template>
