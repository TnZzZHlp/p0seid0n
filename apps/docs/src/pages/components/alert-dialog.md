---
title: Alert dialog
---

<script setup lang="ts">
import AlertDialogBasic from '../../examples/alert-dialog-basic.vue'
</script>

# Alert dialog

An interruptive confirmation modal built on ui-sdk that waits for an explicit
cancel or confirm choice.

<Example name="alert-dialog-basic"><AlertDialogBasic /></Example>

## Differences from Dialog

- Sets `role="alertdialog"` and locks background scroll
- Clicking outside does **not** close the modal
- Opening moves focus onto `AlertDialogCancel` so destructive confirmations are
  never triggered accidentally by a stray Enter press

`AlertDialogAction` and `AlertDialogCancel` share `buttonVariants` from
`button`, so `variant` and `size` work directly without wrapping an inner
`Button` (or pass `as-child` to supply your own element).

## API

| Prop | On | Type | Default |
| --- | --- | --- | --- |
| `open` (`v-model:open`) | `AlertDialog` | boolean | — |
| `defaultOpen` | `AlertDialog` | boolean | — |
| `as` / `asChild` | `AlertDialogTrigger` | tag / boolean | `'button'` / `false` |
| `variant` | `AlertDialogAction` \| `AlertDialogCancel` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` / `'secondary'` |
| `size` | `AlertDialogAction` \| `AlertDialogCancel` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `asChild` | `AlertDialogAction` \| `AlertDialogCancel` | boolean | `false` |

Use `initialFocus` and `finalFocus` on `AlertDialogContent` to set where focus goes
on open and close. Pass a CSS selector, an element, or a function returning one.
Use `"none"` to skip the default focus move. They replace `openAutoFocus` and
`closeAutoFocus`.
