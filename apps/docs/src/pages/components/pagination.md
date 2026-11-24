---
title: Pagination
---

<script setup lang="ts">
import PaginationBasic from '../../examples/pagination-basic.vue'
</script>

# Pagination

Page navigation controls built on ui-sdk, pairing condensed tabular page
numbers with first, previous, next and last triggers.

<Example name="pagination-basic"><PaginationBasic /></Example>

## Scoped page list

`PaginationList` receives the computed `{ items }` array from ui-sdk, with
`{ type: 'page', value }` and `{ type: 'ellipsis' }` entries. Render
`PaginationListItem` for page entries and `PaginationEllipsis` for gaps.

## API

| Prop | On | Type | Default |
| --- | --- | --- | --- |
| `page` (`v-model:page`) | `Pagination` | number | — |
| `defaultPage` | `Pagination` | number | `1` |
| `total` | `Pagination` | number | `0` |
| `itemsPerPage` | `Pagination` | number | `10` |
| `siblingCount` | `Pagination` | number | `1` |
| `showEdges` | `Pagination` | boolean | `true` |
| `disabled` | `Pagination` | boolean | `false` |
| `value` | `PaginationListItem` | number | required |
| `asChild` | items & triggers | boolean | `false` |
