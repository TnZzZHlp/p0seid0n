---
title: Checkbox
---

<script setup lang="ts">
import CheckboxStates from '../../examples/checkbox-states.vue'
</script>

# Checkbox

A three-state check control built on ui-sdk's checkbox primitive: unchecked,
checked and `indeterminate`.

<Example name="checkbox-states"><CheckboxStates /></Example>

## States and indicator

The box uses a 6px radius and fills with `bg-ink` when checked or
indeterminate. Both icons are inline geometric `<svg>` strokes in `text-surface`,
and the indicator animates with `animate-check-in` and `animate-check-out` under
`motion-safe:`.

Override the default mark via the `indicator` slot, which receives `{ state }`:

```vue
<Checkbox v-model="checked">
  <template #indicator="{ state }">
    <span>{{ state === 'indeterminate' ? '-' : 'x' }}</span>
  </template>
</Checkbox>
```

## Keyboard

| Key | Behaviour |
| --- | --- |
| Space | toggles checked state (moves `indeterminate` to `true`) |
| Tab | moves focus to or from the checkbox |

## API

| Prop | Type | Default |
| --- | --- | --- |
| `modelValue` | `boolean \| 'indeterminate' \| null` | — |
| `defaultValue` | `boolean \| 'indeterminate'` | — |
| `invalid` | boolean | `false` |
| `disabled` | boolean | `false` |
| `required` | boolean | `false` |
| `name` | string | — |
| `value` | string | — |
| `id` | string | — |

Slot: `indicator`.
