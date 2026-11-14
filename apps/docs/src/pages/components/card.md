---
title: Card
---

<script setup lang="ts">
import CardAppearance from '../../examples/card-appearance.vue'
</script>

# Card

A 16px panel with a 1px border, split into header, content and footer.

<Example name="card-appearance"><CardAppearance /></Example>

## Two appearances

| Appearance | Background | Use when |
| --- | --- | --- |
| `raised` | `bg-raised` | the card sits on the page background |
| `surface` | `bg-surface` | the card is nested in a raised container |

Both keep the same border and radius; only the fill changes, so nesting stays
readable without a second border treatment.

## Header slots

`CardHeader` takes three slots plus a default:

| Slot | Content |
| --- | --- |
| `title` | the heading; the default slot fills it if `title` is absent |
| `description` | supporting text, usually `text-ink-muted` |
| `action` | trailing content such as a badge or a ghost button |

`CardFooter` draws a top border on its own, so a footer with actions does not need
a separator.

## API

| Component | Props |
| --- | --- |
| `Card` | `appearance: 'raised' \| 'surface'` |
| `CardHeader` | none, slots only |
| `CardContent` | none |
| `CardFooter` | none |
