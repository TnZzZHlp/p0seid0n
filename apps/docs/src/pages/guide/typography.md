<script setup lang="ts">
import { Stat } from '@/components/ui/stat'
import { Sparkline } from '@/components/ui/sparkline'

const samples = [12, 15, 11, 18, 14, 33, 16, 13]
</script>

# Typography and breakpoints

## Two families

`--font-sans` is Barlow, `--font-condensed` is Barlow Semi Condensed. The library
does not ship font files: both names fall back to a system stack, and the docs
site loads `@fontsource` packages itself.

```css
--font-sans: var(--font-barlow, 'Barlow'), system-ui, sans-serif;
--font-condensed:
  var(--font-barlow-semi-condensed, 'Barlow Semi Condensed'), var(--font-barlow, 'Barlow'),
  system-ui, sans-serif;
```

Declaring `--font-barlow` yourself replaces the family; the fallback chain means a
missing font degrades to the system stack rather than to nothing.

## Numerals

Numbers are the one place the condensed family does the work. They are tabular, so
a value that changes every frame does not shift the layout around it.

| Property | Value |
| --- | --- |
| family | `font-condensed` |
| size | 26px, 24px below 640px, 28px from 1024px |
| weight | 500 |
| tracking | `-0.01em` |
| numerals | `font-variant-numeric: tabular-nums` |
| unit | 14px (16px from 1024px), `font-sans`, `text-ink-muted`, 6px inset |
| empty value | `text-ink-faint` |

<Stat label="Latency" value="24.3" unit="ms" />
<Stat label="Jitter" value="2.1" unit="ms" />
<Stat label="Not measured" :value="null" unit="ms" />
<Stat label="Download" value="140" unit="Mbit/s" tone="accent">
  <template #figure><Sparkline :values="samples" class="ml-3" /></template>
</Stat>

A `Stat` renders its value and unit on a shared baseline, and the `figure` slot
inherits the value's font size, so a `Sparkline` inside it measures `0.7em`
against 26px rather than against body text.

## Breakpoints

| Name | Width | What changes |
| --- | --- | --- |
| `sm` | 640px | value text steps down below this |
| `lg` | 1024px | value and unit step up from this |

Only two breakpoints are load-bearing. Layout inside that range is left to the
container: components use `min-h-*` and intrinsic sizing rather than fixed heights,
so they drop into a sidebar or a full-width card without a variant.

## Line height and rhythm

Control surfaces use `leading-none` for values and default leading for prose. The
base `font-sans` stack is used for everything that is not a numeral, which keeps
labels at a consistent rhythm with surrounding text.

Next: pick a component from the sidebar, starting with
[Button](/components/button).
