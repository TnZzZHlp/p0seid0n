---
title: Motion
---

<script setup lang="ts">
import MotionInspector from '../../examples/motion-inspector.vue'
</script>

# Motion

Motion in p0seid0n is fast, directional and token-driven: overlays emerge from
their trigger edge, segmented indicators glide along their track, and exits run
shorter than entries so dismissal never blocks the next click.

## Motion tokens

Every duration and easing curve lives in `styles/p0seid0n.css` alongside the
colour and radius tokens, and is bridged into Tailwind v4 through `@theme inline`:

| Token | Default | Purpose |
| --- | --- | --- |
| `--p0seid0n-duration-fast` | `120ms` | exits, hover highlights, check indicators |
| `--p0seid0n-duration-normal` | `160ms` | menus, tooltips, inputs, switches, tab panels |
| `--p0seid0n-duration-slow` | `200ms` | modal dialogs, backdrops, sliding tab pill, toast reflow |
| `--p0seid0n-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | crisp deceleration on enter |
| `--p0seid0n-ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | clean acceleration on exit |
| `--p0seid0n-ease-spring` | `cubic-bezier(0.22, 1, 0.36, 1)` | button detent, switch thumb, sliding tab indicator |

## Inspect in slow motion

Flip the switch below to multiply all three `--p0seid0n-duration-*` tokens by 4x
on `<html>`, then interact with any control in the preview:

<Example name="motion-inspector"><MotionInspector /></Example>

## Reduced motion

Every keyframe utility is gated behind `motion-safe:` and every CSS transition
carries `motion-reduce:transition-none`. Under `prefers-reduced-motion: reduce`,
all components switch state instantaneously with zero residual transform or delay.

Next: browse components starting with [Button](/components/button).
