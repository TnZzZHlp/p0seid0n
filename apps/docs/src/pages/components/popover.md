---
title: Popover
---

<script setup lang="ts">
import PopoverBasic from '../../examples/popover-basic.vue'
</script>

# Popover

An anchored floating panel built on reka-ui for interactive forms and controls
attached to a trigger.

<Example name="popover-basic"><PopoverBasic /></Example>

## Positioning and motion

`PopoverContent` portals to `body` at `z-50`, keeps the 16px panel radius and
popup shadow, and emerges from its trigger edge via `animate-pop-in` and
`animate-pop-out` under `motion-safe:`.

Use `PopoverTrigger` with `as-child` to wrap a `Button`, and `PopoverClose`
with `as-child` for explicit dismiss actions inside the panel.

## Keyboard

| Key | Behaviour |
| --- | --- |
| Enter / Space on trigger | toggles the popover |
| Tab | moves focus inside the popover (or cycles when `trapFocus` is true) |
| Escape | closes and returns focus to the trigger |

## API

| Prop | On | Type | Default |
| --- | --- | --- | --- |
| `open` (`v-model:open`) | `Popover` | boolean | — |
| `defaultOpen` | `Popover` | boolean | — |
| `modal` | `Popover` | boolean | `false` |
| `as` / `asChild` | `PopoverTrigger` \| `PopoverClose` \| `PopoverAnchor` | tag / boolean | `'button'` / `false` |
| `align` | `PopoverContent` | `'start' \| 'center' \| 'end'` | `'center'` |
| `side` | `PopoverContent` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` |
| `sideOffset` | `PopoverContent` | number | `8` |
| `trapFocus` | `PopoverContent` | boolean | `false` |
