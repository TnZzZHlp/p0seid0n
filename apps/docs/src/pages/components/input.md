---
title: Input
---

<script setup lang="ts">
import InputStates from '../../examples/input-states.vue'
</script>

# Input

A 44px text field with a 12px radius, a control-grey fill and a two-layer focus
treatment.

<Example name="input-states"><InputStates /></Example>

## States

| State | Border | Ring |
| --- | --- | --- |
| rest | `border-line` | none |
| focus | `ink` | 2px `outline-ink` at 2px offset |
| `invalid` | `border-danger` | `outline-danger` |
| `disabled` | unchanged | none, 55% opacity |

`invalid` writes `aria-invalid="true"` and the styling is driven from that
attribute, so the visual state and the accessible state cannot disagree.

## Pairing with Label

Give the input an `id` and point the label's `for` at it. Both components pass the
attribute through untouched, so the native association works:

```vue
<Label for="email" required>Email</Label>
<Input id="email" v-model="email" invalid />
```

## API

| Prop | Type | Default |
| --- | --- | --- |
| `modelValue` | string \| number | `''` |
| `invalid` | boolean | `false` |
| `disabled` | boolean | `false` |
| `id` | string | — |

All other attributes go to the underlying `<input>`.
