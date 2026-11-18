---
title: Breadcrumb
---

<script setup lang="ts">
import BreadcrumbBasic from '../../examples/breadcrumb-basic.vue'
</script>

# Breadcrumb

A hierarchical location trail with links, customisable separators, an ellipsis
marker and a current-page indicator.

<Example name="breadcrumb-basic"><BreadcrumbBasic /></Example>

## Router links

`BreadcrumbLink` uses reka-ui's `Primitive`, so you can pass `as-child` to wrap
a framework router link while preserving the muted hover colour and focus ring:

```vue
<BreadcrumbLink as-child>
  <RouterLink to="/regions">Regions</RouterLink>
</BreadcrumbLink>
```

## API

| Component | Key props / role |
| --- | --- |
| `Breadcrumb` | `<nav aria-label="Breadcrumb">` |
| `BreadcrumbList` | `<ol>` flex list |
| `BreadcrumbItem` | `<li>` container |
| `BreadcrumbLink` | `as` (`'a'`), `asChild` (`false`) |
| `BreadcrumbPage` | `aria-current="page"`, non-interactive |
| `BreadcrumbSeparator` | decorative `<li>`, defaults to `/` |
| `BreadcrumbEllipsis` | decorative ellipsis icon with `.sr-only` label |
