<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
</script>

<template>
  <div class="grid max-w-lg gap-3">
    <Alert>
      <template #icon>
        <svg
          class="size-4"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="6" />
          <path d="M8 7.5v3.5" />
          <path d="M8 5h.01" />
        </svg>
      </template>
      <AlertTitle>Scheduled maintenance</AlertTitle>
      <AlertDescription>
        European probes will pause for ten minutes on Sunday at 02:00 UTC.
      </AlertDescription>
    </Alert>

    <Alert variant="accent">
      <template #icon>
        <svg
          class="size-4"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m3.5 8.5 3 3 6-6.5" />
        </svg>
      </template>
      <AlertTitle>Telemetry synced</AlertTitle>
      <AlertDescription>
        All 18 edge nodes reported healthy round-trip latency under 35 ms.
      </AlertDescription>
    </Alert>

    <Alert variant="danger">
      <template #icon>
        <svg
          class="size-4"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M8 2.5 14 13H2L8 2.5Z" />
          <path d="M8 6.5v3" />
          <path d="M8 11.25h.01" />
        </svg>
      </template>
      <AlertTitle>Packet loss threshold exceeded</AlertTitle>
      <AlertDescription>
        Tokyo gateway reported 4.2% dropped frames over the last five minutes.
      </AlertDescription>
    </Alert>
  </div>
</template>
