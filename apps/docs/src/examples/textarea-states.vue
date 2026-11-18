<script setup lang="ts">
import { ref } from 'vue'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const notes = ref('Packet loss spiked briefly on the Frankfurt uplink.')
const empty = ref('')
const locked = ref('Read-only diagnostics snapshot.')
</script>

<template>
  <div class="grid max-w-md gap-4">
    <div class="grid gap-1.5">
      <Label for="demo-textarea-notes" required>Notes</Label>
      <Textarea id="demo-textarea-notes" v-model="notes" placeholder="Add observations..." />
    </div>
    <div class="grid gap-1.5">
      <Label for="demo-textarea-invalid">Incident summary</Label>
      <Textarea
        id="demo-textarea-invalid"
        v-model="empty"
        :rows="3"
        invalid
        placeholder="Describe what changed"
      />
      <p class="text-[12px] text-danger">A summary is required before closing.</p>
    </div>
    <div class="grid gap-1.5">
      <Label for="demo-textarea-locked">Archived log</Label>
      <Textarea id="demo-textarea-locked" v-model="locked" :rows="2" disabled />
    </div>
  </div>
</template>
