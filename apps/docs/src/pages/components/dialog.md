---
title: Dialog
---

<script setup lang="ts">
import DialogBasic from '../../examples/dialog-basic.vue'
</script>

# Dialog

A centred modal with an overlay, a title, a description and a built-in close
control.

<Example name="dialog-basic"><DialogBasic /></Example>

## What the panel guarantees

- `role="dialog"` and `aria-modal="true"`
- `aria-labelledby` from `DialogTitle`, `aria-describedby` from `DialogDescription`
- focus moves into the panel on open and returns to the trigger on close
- Tab cycles inside the panel; it cannot reach the page behind
- background scroll is locked while open
- Escape and outside clicks close it

All six were verified in a browser; see the source in the registry for the exact
attributes.

## Closing

| Control | Closes |
| --- | --- |
| Escape | yes, unless `closeOnEsc` is false |
| pointer down outside | yes, unless `closeOnOutside` is false |
| the built-in close button | always |
| `DialogClose` | always |

Set `hideClose` on `DialogContent` when your own footer carries the dismiss action
and the corner button would be redundant.

::: tip Always render a title
`DialogTitle` supplies the accessible name. Without it a screen reader announces
only "dialog".
:::

## API

| Prop | On | Type | Default |
| --- | --- | --- | --- |
| `open` (`v-model:open`) | `Dialog` | boolean | — |
| `defaultOpen` | `Dialog` | boolean | — |
| `closeOnEsc` | `Dialog` | boolean | `true` |
| `closeOnOutside` | `Dialog` | boolean | `true` |
| `hideClose` | `DialogContent` | boolean | `false` |
