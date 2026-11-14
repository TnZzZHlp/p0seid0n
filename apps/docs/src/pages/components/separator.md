---
title: Separator
---

<script setup lang="ts">
import SeparatorOrientation from '../../examples/separator-orientation.vue'
</script>

# Separator

A single line in the border colour. Horizontal by default.

<Example name="separator-orientation"><SeparatorOrientation /></Example>

A vertical separator stretches to its container's height, so give the row a
height (`h-10` above) rather than leaving it to intrinsic sizing.

## Decorative or not

`decorative` defaults to `true`, which renders `role="presentation"` and
`aria-hidden="true"`: a rule between two blocks is visual noise to a screen
reader. Set `:decorative="false"` when the line carries meaning, and the component
emits `role="separator"` with `aria-orientation` instead.

## API

| Prop | Type | Default |
| --- | --- | --- |
| `orientation` | `horizontal` \| `vertical` | `horizontal` |
| `decorative` | boolean | `true` |
