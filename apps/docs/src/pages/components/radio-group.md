---
title: Radio group
---

<script setup lang="ts">
import RadioGroupBasic from '../../examples/radio-group-basic.vue'
</script>

# Radio group

A mutually exclusive option list built on reka-ui, in vertical or horizontal
orientations.

<Example name="radio-group-basic"><RadioGroupBasic /></Example>

## Orientation

`RadioGroup` defaults to a vertical stack (`gap-2.5`). Set
`orientation="horizontal"` to arrange items in a row with `gap-4`.

## Keyboard

| Key | Behaviour |
| --- | --- |
| Tab | enters or leaves the radio group |
| ArrowUp / ArrowLeft | moves selection to the previous enabled item |
| ArrowDown / ArrowRight | moves selection to the next enabled item |
| Space | selects the focused item |

## API

| Prop | On | Type | Default |
| --- | --- | --- | --- |
| `modelValue` | `RadioGroup` | string | — |
| `defaultValue` | `RadioGroup` | string | — |
| `orientation` | `RadioGroup` | `'vertical' \| 'horizontal'` | `'vertical'` |
| `loop` | `RadioGroup` | boolean | `true` |
| `disabled` | `RadioGroup` \| `RadioGroupItem` | boolean | `false` |
| `required` | `RadioGroup` \| `RadioGroupItem` | boolean | `false` |
| `name` | `RadioGroup` | string | — |
| `value` | `RadioGroupItem` | string | required |
| `invalid` | `RadioGroupItem` | boolean | `false` |
| `id` | `RadioGroupItem` | string | — |

Slot on `RadioGroupItem`: `indicator`.
