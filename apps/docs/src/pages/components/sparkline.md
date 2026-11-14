---
title: Sparkline
---

<script setup lang="ts">
import SparklineTone from '../../examples/sparkline-tone.vue'
import SparklineEdges from '../../examples/sparkline-edges.vue'
</script>

# Sparkline

A bar strip for a numeric series, drawn by hand in SVG. No chart library, no
formatting, no interaction.

<Example name="sparkline-tone"><SparklineTone /></Example>

## Geometry

Each bar fills 60% of its slot; the rest is the gap to its neighbour. The viewBox
is `0 0 slots 1` with `preserveAspectRatio="none"`, so the strip stretches to
whatever width it is given without recalculating the path.

## Scaling

The value axis is capped at three times the median, so a few spikes cannot flatten
the rest of the series. Below three samples the median is too noisy to cap
against, so the maximum is used instead.

Any bar above the cap is clamped to full height. In the third example above, the
single spike reaches the top while the rest keep their proportions.

## Edges

<Example name="sparkline-edges"><SparklineEdges /></Example>

| Input | Result |
| --- | --- |
| `[]` | no path, size kept |
| `[42]` | one bar |
| `[0, 0, 0, 0]` | flat, no error |

## Height

Height defaults to `0.7em`, so the strip scales with its context. Beside a 26px
value that is about 18px; standalone, set a `font-size` on the parent or pass
`height`.

## Accessibility

Without `ariaLabel` the graphic is `aria-hidden="true"`, which is right when a
`Stat` already states the value. Pass `ariaLabel` to expose `role="img"` instead.

## API

| Prop | Type | Default |
| --- | --- | --- |
| `values` | number[] | required |
| `max` | number | derived |
| `baseline` | boolean | `false` |
| `tone` | `default` \| `accent` \| `accent-alt` | `default` |
| `ariaLabel` | string | — |
| `slots` | number | `values.length` |
| `height` | string | `0.7em` |

`median`, `scaleTop` and `sparklinePath` are exported for building your own
graphic with the same scaling.
