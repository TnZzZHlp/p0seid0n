---
title: Stat
---

<script setup lang="ts">
import StatBasic from '../../examples/stat-basic.vue'
import StatFigure from '../../examples/stat-figure.vue'
</script>

# Stat

A label, a condensed value, an optional unit and a slot for an inline figure.

<Example name="stat-basic"><StatBasic /></Example>

## Value typography

| Property | Value |
| --- | --- |
| family | `font-condensed` |
| size | 26px, 24px below 640px, 28px from 1024px |
| weight | 500 |
| tracking | `-0.01em` |
| numerals | `tabular-nums` |
| unit | 14px (16px from 1024px), `font-sans`, `text-ink-muted`, 6px inset |
| empty | `emptyText` in `text-ink-faint`, unit hidden |

Values are preformatted strings, so locale and rounding stay with you. The
component renders what it is given and does no number formatting.

## Tones

| Tone | Colour |
| --- | --- |
| `default` | `text-ink` |
| `accent` | `text-accent` |
| `accent-alt` | `text-danger` |

## Inline figures

<Example name="stat-figure"><StatFigure /></Example>

The `figure` slot sits beside the value on a shared baseline and inherits the
value's font size. That is what makes a `Sparkline` inside it measure `0.7em`
against 26px rather than against body text.

## API

| Prop | Type | Default |
| --- | --- | --- |
| `label` | string | required |
| `value` | string \| number \| null | `null` |
| `unit` | string | — |
| `emptyText` | string | `—` |
| `tone` | `default` \| `accent` \| `accent-alt` | `default` |

Slot: `figure`.
