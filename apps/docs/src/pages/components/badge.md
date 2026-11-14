---
title: Badge
---

<script setup lang="ts">
import BadgeVariants from '../../examples/badge-variants.vue'
</script>

# Badge

A short label that never competes with the value it describes: 12px type, 22px
tall, 10px radius.

<Example name="badge-variants"><BadgeVariants /></Example>

| Variant | Fill | Text |
| --- | --- | --- |
| `neutral` | `bg-control` | `text-ink-muted` |
| `accent` | accent mixed 88% toward ink | `text-surface` |
| `accent-alt` | `bg-danger` | `text-surface` |
| `outline` | transparent, 1px `border-line` | `text-ink-muted` |

Both accent fills are darkened from the raw tokens so their labels clear 4.5:1
against surface text. The raw `--color-accent` on its own measures 4.30:1.

## API

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `neutral` \| `accent` \| `accent-alt` \| `outline` | `neutral` |
