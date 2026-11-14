---
title: Tabs
---

<script setup lang="ts">
import TabsBasic from '../../examples/tabs-basic.vue'
</script>

# Tabs

A trigger strip with an inset track and panels below it.

<Example name="tabs-basic"><TabsBasic /></Example>

## Keyboard

| Key | Behaviour |
| --- | --- |
| Tab | enters the strip at the selected trigger |
| ArrowLeft / ArrowRight | moves to the previous or next trigger, wrapping around |
| Home / End | jumps to the first or last enabled trigger |
| Enter / Space | activates, in manual mode |

Disabled triggers are skipped by the arrow keys. `activationMode` defaults to
`automatic`, which switches panel on arrow key; set `manual` to require Enter.

## Panels stay mounted

By default inactive panels remain in the DOM (hidden), so form state and scroll
position survive a tab change. Set `unmount-on-hide` to drop them instead, which
trades that for a smaller tree.

## API

| Prop | On | Type | Default |
| --- | --- | --- | --- |
| `modelValue` | `Tabs` | string \| number | first trigger |
| `orientation` | `Tabs` | `horizontal` \| `vertical` | `horizontal` |
| `activationMode` | `Tabs` | `automatic` \| `manual` | `automatic` |
| `unmountOnHide` | `Tabs` | boolean | `false` |
| `loop` | `TabsList` | boolean | `true` |
| `value` | `TabsTrigger` / `TabsContent` | string \| number | required |
