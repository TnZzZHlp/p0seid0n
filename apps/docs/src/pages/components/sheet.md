---
title: Sheet
---

<script setup lang="ts">
import SheetSides from '../../examples/sheet-sides.vue'
</script>

# Sheet

An edge-anchored modal drawer sliding from any of the four viewport edges,
built on reka-ui's dialog primitive.

<Example name="sheet-sides"><SheetSides /></Example>

## Sides and motion

`SheetContent` picks an edge with `side` (`right` by default) and sets
`--p0seid0n-sheet-x` / `--p0seid0n-sheet-y` so `animate-sheet-in` and
`animate-sheet-out` translate strictly from that edge under `motion-safe:`.

Always render `SheetTitle` inside `SheetContent` so screen readers announce the
drawer's accessible name.

## API

| Prop | On | Type | Default |
| --- | --- | --- | --- |
| `open` (`v-model:open`) | `Sheet` | boolean | — |
| `defaultOpen` | `Sheet` | boolean | — |
| `as` / `asChild` | `SheetTrigger` \| `SheetClose` | tag / boolean | `'button'` / `false` |
| `side` | `SheetContent` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'right'` |
| `hideClose` | `SheetContent` | boolean | `false` |
| `closeOnEsc` | `SheetContent` | boolean | `true` |
| `closeOnOutside` | `SheetContent` | boolean | `true` |
