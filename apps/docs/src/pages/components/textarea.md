---
title: Textarea
---

<script setup lang="ts">
import TextareaStates from '../../examples/textarea-states.vue'
</script>

# Textarea

A multi-line text field matching `Input`: 12px radius, control-grey fill and a
two-layer focus ring.

<Example name="textarea-states"><TextareaStates /></Example>

## States

| State | Border | Ring |
| --- | --- | --- |
| rest | `border-line` | none |
| focus | `ink` | 2px `outline-ink` at 2px offset |
| `invalid` | `border-danger` | `outline-danger` |
| `disabled` | unchanged | none, 55% opacity |

`invalid` writes `aria-invalid="true"` and drives the danger border from that
attribute, keeping visual and accessible state aligned.

## Pairing with Label

Pass a matching `id` and `for` to link the field with a `Label`:

```vue
<Label for="notes" required>Notes</Label>
<Textarea id="notes" v-model="notes" :rows="4" />
```

## API

| Prop | Type | Default |
| --- | --- | --- |
| `modelValue` | string | `''` |
| `rows` | number | `4` |
| `invalid` | boolean | `false` |
| `disabled` | boolean | `false` |
| `id` | string | — |

All other attributes go to the underlying `<textarea>`.
