---
title: Button
---

<script setup lang="ts">
import ButtonVariants from '../../examples/button-variants.vue'
import ButtonSizes from '../../examples/button-sizes.vue'
import ButtonSlots from '../../examples/button-slots.vue'
import ButtonStates from '../../examples/button-states.vue'
</script>

# Button

Four surfaces and three sizes. The component owns its click handling so `loading`
and `disabled` also block a handler passed from the parent, including when the
root is a link.

## Variants

<Example name="button-variants"><ButtonVariants /></Example>

| Variant | Fill | Text |
| --- | --- | --- |
| `primary` | `bg-ink` | `text-surface` |
| `secondary` | `bg-control` | `text-ink` |
| `ghost` | transparent | `text-ink` |
| `danger` | `bg-danger` | `text-surface` |

Hover moves each fill one step: the ink fill mixes 86% toward surface, and danger
mixes toward ink so contrast rises rather than falls.

## Sizes

<Example name="button-sizes"><ButtonSizes /></Example>

| Size | Min height | Inline padding | Type |
| --- | --- | --- | --- |
| `sm` | 32px | 12px | 13px |
| `md` | 44px | 24px | 15px |
| `lg` | 52px | 32px | 17px |

All three share the 12px control radius.

## States

<Example name="button-states"><ButtonStates /></Example>

`loading` sets `aria-busy`, disables interaction and leaves the `progress` slot
free for a fill layer. `disabled` sets the native attribute on buttons and
`aria-disabled` on anything else. Both drop opacity to 55%.

## Slots

<Example name="button-slots"><ButtonSlots /></Example>

| Slot | Placement |
| --- | --- |
| `progress` | behind the content, for an inset fill |
| `leading` | before the label |
| `trailing` | after the label |
| default | the label |

No icons are bundled; pass them through `leading` or `trailing`.

## API

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `primary` \| `secondary` \| `ghost` \| `danger` | `primary` |
| `size` | `sm` \| `md` \| `lg` | `md` |
| `as` | element or component | `button` |
| `type` | `button` \| `submit` \| `reset` | `button` |
| `loading` | boolean | `false` |
| `disabled` | boolean | `false` |

`buttonVariants({ variant, size })` is exported for building your own trigger with
the same surface, for example a menu trigger.
