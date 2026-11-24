---
title: Accordion
---

<script setup lang="ts">
import AccordionBasic from '../../examples/accordion-basic.vue'
import AccordionMultiple from '../../examples/accordion-multiple.vue'
</script>

# Accordion

Vertically stacked disclosure sections built on ui-sdk, supporting single or
multiple open panels.

<Example name="accordion-basic"><AccordionBasic /></Example>

## Multiple panels, disabled items and custom icons

Pass an array to `default-value` or `v-model` (or set `type="multiple"`) to
allow several sections open at once, mark individual `AccordionItem` entries
`disabled`, and override the indicator through `AccordionTrigger`'s `icon` slot.

<Example name="accordion-multiple"><AccordionMultiple /></Example>

## Motion

`AccordionContent` transitions its measured height and opacity on open and
close under `motion-safe:`,
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
