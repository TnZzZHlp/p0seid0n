---
title: Switch
---

<script setup lang="ts">
import SwitchSizes from '../../examples/switch-sizes.vue'
import SwitchThumbSlot from '../../examples/switch-thumb-slot.vue'
</script>

# Switch

A two-state control on reka-ui's switch primitive. Space and Enter toggle it, and
`aria-checked` follows the value.

<Example name="switch-sizes"><SwitchSizes /></Example>

| Size | Track | Thumb |
| --- | --- | --- |
| `md` | 44 x 28 | 24 |
| `lg` | 64 x 40 | 32 |

## Thumb slot

<Example name="switch-thumb-slot"><SwitchThumbSlot /></Example>

The slot is empty by default so an icon can be passed without adding a dependency.

## Motion

Transitions run for 150ms and are dropped entirely under
`prefers-reduced-motion: reduce`, on both the track and the thumb.

## API

| Prop | Type | Default |
| --- | --- | --- |
| `modelValue` | boolean | `false` |
| `disabled` | boolean | `false` |
| `size` | `md` \| `lg` | `md` |

Give it an accessible name with a `Label` and a shared `id`, or an `aria-label`.
