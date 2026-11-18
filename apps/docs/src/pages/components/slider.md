---
title: Slider
---

<script setup lang="ts">
import SliderRange from '../../examples/slider-range.vue'
</script>

# Slider

A continuous or stepped numeric slider built on reka-ui. Pass one element in the
array for a single thumb, or two or more for a range.

<Example name="slider-range"><SliderRange /></Example>

## Accessible thumb names

Because the interactive `role="slider"` lives on each thumb rather than the root
track, `Slider` forwards `aria-label` or `aria-labelledby` to the thumbs. For
multi-thumb ranges, pass `thumbLabels` with one label per thumb:

```vue
<Slider
  v-model="range"
  :min-steps-between-thumbs="2"
  :thumb-labels="['Minimum', 'Maximum']"
/>
```

## Keyboard

| Key | Behaviour |
| --- | --- |
| ArrowLeft / ArrowDown | decreases by `step` |
| ArrowRight / ArrowUp | increases by `step` |
| Shift + Arrow / PageUp / PageDown | moves by `step * 10` |
| Home / End | jumps to `min` or `max` |

## API

| Prop | Type | Default |
| --- | --- | --- |
| `modelValue` | `number[]` | — |
| `defaultValue` | `number[]` | `[0]` |
| `min` | number | `0` |
| `max` | number | `100` |
| `step` | number | `1` |
| `minStepsBetweenThumbs` | number | `0` |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` |
| `disabled` | boolean | `false` |
| `inverted` | boolean | `false` |
| `name` | string | — |
| `thumbLabels` | `string[]` | — |

Emits: `update:modelValue`, `valueCommit`.
