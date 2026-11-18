---
title: Alert
---

<script setup lang="ts">
import AlertVariants from '../../examples/alert-variants.vue'
</script>

# Alert

An inline callout banner in `neutral`, `accent` and `danger` variants, using
`color-mix()` against the theme tokens without adding colour literals.

<Example name="alert-variants"><AlertVariants /></Example>

## Variants and roles

| Variant | Default role | Use when |
| --- | --- | --- |
| `neutral` | `status` | general notices and maintenance windows |
| `accent` | `status` | positive confirmation or active status |
| `danger` | `alert` | errors, warnings and threshold breaches |

Pass an explicit `role` attribute on `Alert` to override the default.

## API

| Component | Props / Slots | Default |
| --- | --- | --- |
| `Alert` | `variant`: `'neutral' \| 'accent' \| 'danger'` | `'neutral'` |
| `Alert` | slot `icon` | — |
| `AlertTitle` | default slot (`<h5>`) | — |
| `AlertDescription` | default slot (`<div>`) | — |
