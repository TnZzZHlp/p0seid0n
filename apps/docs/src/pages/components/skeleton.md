---
title: Skeleton
---

<script setup lang="ts">
import SkeletonCard from '../../examples/skeleton-card.vue'
</script>

# Skeleton

A low-contrast loading placeholder using `bg-control` and `animate-pulse` under
`motion-safe:`.

<Example name="skeleton-card"><SkeletonCard /></Example>

## Sizing and accessibility

Size `Skeleton` with Tailwind utilities such as `h-4 w-48` or `size-11
rounded-full` — `cn()` merges your border radius over the default
`rounded-control`.

The element sets `aria-hidden="true"` by default and disables pulsing under
`prefers-reduced-motion: reduce`.

## API

`Skeleton` forwards all attributes and merges `class` onto the underlying `<div>`.
