---
title: Label
---

<script setup lang="ts">
import LabelRequired from '../../examples/label-required.vue'
</script>

# Label

A caption at 13px in the muted ink colour, associated with a control through the
native `for` attribute.

<Example name="label-required"><LabelRequired /></Example>

## The required marker

`required` appends a decorative asterisk in the danger colour. It is
`aria-hidden`, so it does not reach the accessible name: set `required` or
`aria-required` on the control itself, which is what assistive technology reads.

## API

| Prop | Type | Default |
| --- | --- | --- |
| `for` | string | — |
| `required` | boolean | `false` |
