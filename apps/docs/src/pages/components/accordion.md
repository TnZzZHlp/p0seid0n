---
title: Accordion
---

<script setup lang="ts">
import AccordionBasic from '../../examples/accordion-basic.vue'
</script>

# Accordion

Vertically stacked disclosure sections built on reka-ui, supporting single or
multiple open panels.

<Example name="accordion-basic"><AccordionBasic /></Example>

## Motion

`AccordionContent` animates `height` against `--reka-accordion-content-height`
using `animate-accordion-down` and `animate-accordion-up` under `motion-safe:`,
while the trigger's chevron rotates 180 degrees via `group-data-[state=open]`.

## Keyboard

| Key | Behaviour |
| --- | --- |
| Enter / Space | expands or collapses the focused trigger |
| ArrowDown / ArrowUp | moves focus between enabled triggers |
| Home / End | jumps to the first or last trigger |

## API

| Prop | On | Type | Default |
| --- | --- | --- | --- |
| `modelValue` | `Accordion` | `string \| string[]` | — |
| `defaultValue` | `Accordion` | `string \| string[]` | — |
| `type` | `Accordion` | `'single' \| 'multiple'` | `'single'` |
| `collapsible` | `Accordion` | boolean | `true` |
| `disabled` | `Accordion` \| `AccordionItem` | boolean | `false` |
| `unmountOnHide` | `Accordion` | boolean | `true` |
| `value` | `AccordionItem` | string | required |

Slot on `AccordionTrigger`: `icon`.
