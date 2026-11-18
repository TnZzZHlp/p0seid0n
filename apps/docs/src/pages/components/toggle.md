---
title: Toggle
---

<script setup lang="ts">
import ToggleVariants from '../../examples/toggle-variants.vue'
</script>

# Toggle

A two-state pressed button built on reka-ui, in `default` and `outline`
variants across three sizes.

<Example name="toggle-variants"><ToggleVariants /></Example>

## Pressed state

`Toggle` tracks a boolean `modelValue` (or `defaultValue` when uncontrolled),
exposes `aria-pressed` and `data-state="on"` / `"off"`, and shares the spring
detent press animation from `Button`.

When rendering an icon-only toggle, always give it an `aria-label`.

## API

| Prop | Type | Default |
| --- | --- | --- |
| `modelValue` | boolean | — |
| `defaultValue` | boolean | `false` |
| `variant` | `'default' \| 'outline'` | `'default'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `disabled` | boolean | `false` |
| `name` | string | — |
| `required` | boolean | `false` |

Slot props: `{ modelValue, disabled, pressed, state }`.
