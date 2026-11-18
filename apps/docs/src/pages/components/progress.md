---
title: Progress
---

<script setup lang="ts">
import ProgressStates from '../../examples/progress-states.vue'
</script>

# Progress

A determinate and indeterminate progress track built on reka-ui, in `default`,
`accent` and `danger` tones.

<Example name="progress-states"><ProgressStates /></Example>

## Determinate and indeterminate

Pass a number between `0` and `max` to `modelValue` for a determinate bar, or
omit `modelValue` (or pass `null`) for an indeterminate loading sweep. Both
respect `prefers-reduced-motion: reduce`.

## API

| Prop | Type | Default |
| --- | --- | --- |
| `modelValue` | `number \| null` | `null` |
| `max` | number | `100` |
| `tone` | `'default' \| 'accent' \| 'danger'` | `'default'` |

Give every `Progress` bar an accessible name with `aria-label` or
`aria-labelledby`.
