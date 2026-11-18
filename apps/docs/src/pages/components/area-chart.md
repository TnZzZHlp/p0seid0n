---
title: Area chart
---

<script setup lang="ts">
import AreaChartSeries from '../../examples/area-chart-series.vue'
</script>

# Area chart

A hand-written SVG area chart with zero charting dependencies, supporting single
numeric arrays or multi-series tabular data.

<Example name="area-chart-series"><AreaChartSeries /></Example>

## Single and multi-series input

Pass `values` (`number[]`) for a single compact series, or pass `data`,
`categories` and `index` for multiple named series on a shared axis. By default
multiple series cycle through `accent`, `accent-alt`, `default` and `danger`
using semantic theme tokens with soft vertical gradient fills.

## Monotone curves and scrubbing

`curve="monotone"` fits Fritsch-Carlson cubic tangents so smooth splines never
overshoot local extrema; switch to `curve="linear"` for straight segments.
Moving a pointer across the chart scrubs a vertical hairline, point markers and
a floating condensed-numeral readout.

## API

| Prop | Type | Default |
| --- | --- | --- |
| `values` | `number[]` | — |
| `data` | `Record<string, unknown>[]` | — |
| `categories` | `string[]` | numeric keys |
| `index` | string | — |
| `tone` | `'accent' \| 'accent-alt' \| 'default' \| 'danger'` | `'accent'` |
| `tones` | `AreaTone[]` | `['accent', 'accent-alt', 'default', 'danger']` |
| `curve` | `'monotone' \| 'linear'` | `'monotone'` |
| `max` | number | derived |
| `height` | string | `'12rem'` |
| `showGrid` | boolean | `true` |
| `showXAxis` | boolean | `false` |
| `showLegend` | boolean | auto (`series.length > 1`) |
| `showTooltip` | boolean | `true` |
| `valueFormatter` | `(value: number) => string` | `String` |
| `ariaLabel` | string | — |

`areaPaths`, `niceMax` and `normalizeAreaData` are exported for custom graphics.
