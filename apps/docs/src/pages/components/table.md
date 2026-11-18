---
title: Table
---

<script setup lang="ts">
import TableBasic from '../../examples/table-basic.vue'
</script>

# Table

Responsive HTML table primitives with `border-line` dividers, subtle row hover
highlights and condensed tabular numeric columns.

<Example name="table-basic"><TableBasic /></Example>

## Numeric columns

Set `numeric` on both `TableHead` and `TableCell` for measurement or currency
columns. `TableHead` aligns the heading right, and `TableCell` switches to
`font-condensed` with `tabular-nums` and `-0.01em` tracking so columns align
cleanly down the page.

Mark selected rows with `data-state="selected"` on `TableRow`.

## API

| Component | Props | Default |
| --- | --- | --- |
| `Table` | none (wraps `<table>` in an `overflow-x-auto` container) | — |
| `TableHeader` | none | — |
| `TableBody` | none | — |
| `TableFooter` | none | — |
| `TableRow` | none | — |
| `TableHead` | `numeric`: boolean | `false` |
| `TableCell` | `numeric`: boolean | `false` |
| `TableCaption` | none | — |
