---
title: Tooltip
---

<script setup lang="ts">
import TooltipSides from '../../examples/tooltip-sides.vue'
</script>

# Tooltip

A hint on hover and on keyboard focus, after a delay.

<Example name="tooltip-sides"><TooltipSides /></Example>

## Accessibility

While the tip is open, the trigger carries `aria-describedby` pointing at a
visually hidden node with `role="tooltip"`. That node holds the text, so the tip is
announced once and not duplicated in the visual layout.

Escape dismisses the tip without moving focus, which keeps keyboard flow intact.

## Delay

`delay` maps to the provider's `delayDuration` and defaults to 300ms. A short delay
is worth using for repeated controls, as in the example above.

## Shortcut hint

`shortcut` appends a small key hint after the label. It is inside the content, so
it is part of the described text rather than a separate element.

## API

| Prop | On | Type | Default |
| --- | --- | --- | --- |
| `delay` | `Tooltip` | number (ms) | `300` |
| `disabled` | `Tooltip` | boolean | `false` |
| `side` | `TooltipContent` | `top` \| `right` \| `bottom` \| `left` | `top` |
| `align` | `TooltipContent` | `start` \| `center` \| `end` | `center` |
| `sideOffset` | `TooltipContent` | number | `6` |
| `shortcut` | `TooltipContent` | string | — |
