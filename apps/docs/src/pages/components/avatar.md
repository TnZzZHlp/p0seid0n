---
title: Avatar
---

<script setup lang="ts">
import AvatarSizes from '../../examples/avatar-sizes.vue'
</script>

# Avatar

An image container with automatic fallback built on ui-sdk, in three sizes and
`circle` or `square` shapes.

<Example name="avatar-sizes"><AvatarSizes /></Example>

## Fallback timing

`AvatarFallback` stays visible while `AvatarImage` loads or when an image fails
to load. Pass `delayMs` on `AvatarFallback` to suppress a brief flash on fast
connections.

## API

| Prop | On | Type | Default |
| --- | --- | --- | --- |
| `size` | `Avatar` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `shape` | `Avatar` | `'circle' \| 'square'` | `'circle'` |
| `src` | `AvatarImage` | string | required |
| `alt` | `AvatarImage` | string | `''` |
| `delayMs` | `AvatarFallback` | number | — |
