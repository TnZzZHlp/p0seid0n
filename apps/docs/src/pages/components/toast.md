---
title: Toast
---

<script setup lang="ts">
import ToastVariants from '../../examples/toast-variants.vue'
import ToastStacking from '../../examples/toast-stacking.vue'
import { ToastProvider } from '@/components/ui/toast'
</script>

# Toast

A notification stack with a provider, a `useToast()` composable and three
variants. It is self-implemented rather than wrapping a library, so its layer
order is fixed and predictable.

<ToastProvider>
  <Example name="toast-variants"><ToastVariants /></Example>
  <Example name="toast-stacking"><ToastStacking /></Example>
</ToastProvider>

## Setup

Wrap the app once. `useToast()` must be called in a **descendant** of the provider,
not in the same `setup` that renders it:

```vue
<!-- App.vue -->
<template>
  <ToastProvider>
    <AppShell />
  </ToastProvider>
</template>
```

```ts
// inside AppShell
const { toast } = useToast()
toast({ title: 'Saved', variant: 'success' })
```

Calling outside a provider throws instead of dropping the notification, so a
missing wrapper surfaces during development rather than in production.

## Options

| Option | Type | Default |
| --- | --- | --- |
| `title` | string | required |
| `description` | string | — |
| `variant` | `default` \| `success` \| `danger` | `default` |
| `duration` | number (ms) | provider's `duration` |
| `action` | `{ label, onClick }` | — |
| `id` | string | generated |

`duration: 0` keeps a notification open until dismissed.

## Stacking

The provider keeps at most `max` notifications (3 by default) and drops the oldest
when a new one would exceed that. The stack sits at `z-60`, above the dialog panel
at `z-50`, so a notification raised from inside a dialog stays visible.

## Motion

Entry runs for 150ms and is removed under `prefers-reduced-motion: reduce`. The
keyframes live in the theme item, so installing `toast` without `theme` degrades
to no animation rather than a layout shift.

## API

| Prop | Type | Default |
| --- | --- | --- |
| `duration` | number (ms) | `4000` |
| `max` | number | `3` |

`useToast()` returns `{ toast, dismiss, dismissAll }`.
