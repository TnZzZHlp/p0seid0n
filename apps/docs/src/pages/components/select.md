---
title: Select
---

<script setup lang="ts">
import SelectBasic from '../../examples/select-basic.vue'
</script>

# Select

An accessible option picker built on reka-ui. The trigger shares `Input`'s
44px height, 12px radius and `invalid` border, while the popup reuses the 16px
menu surface.

<Example name="select-basic"><SelectBasic /></Example>

## Non-empty values

Every `SelectItem` must receive a non-empty `value` string. Empty strings are
reserved by reka-ui to clear the selection and render the `SelectValue`
placeholder.

## Keyboard

| Key | Behaviour |
| --- | --- |
| Enter / Space / ArrowDown / ArrowUp on trigger | opens the list and highlights the selected or first item |
| ArrowUp / ArrowDown | moves between enabled options |
| Character keys | typeahead jumps to matching options |
| Enter / Space | selects the highlighted option and closes |
| Escape | closes and returns focus to the trigger |

## API

| Prop | On | Type | Default |
| --- | --- | --- | --- |
| `modelValue` | `Select` | string | — |
| `defaultValue` | `Select` | string | — |
| `open` (`v-model:open`) | `Select` | boolean | — |
| `defaultOpen` | `Select` | boolean | — |
| `disabled` | `Select` \| `SelectTrigger` \| `SelectItem` | boolean | `false` |
| `name` | `Select` | string | — |
| `required` | `Select` | boolean | `false` |
| `invalid` | `SelectTrigger` | boolean | `false` |
| `id` | `SelectTrigger` | string | — |
| `placeholder` | `SelectValue` | string | — |
| `position` | `SelectContent` | `'popper' \| 'item-aligned'` | `'popper'` |
| `side` | `SelectContent` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` |
| `align` | `SelectContent` | `'start' \| 'center' \| 'end'` | `'start'` |
| `sideOffset` | `SelectContent` | number | `6` |
| `value` | `SelectItem` | string | required |
| `textValue` | `SelectItem` | string | — |

Slots: `icon` on `SelectTrigger`, `indicator` on `SelectItem`.
