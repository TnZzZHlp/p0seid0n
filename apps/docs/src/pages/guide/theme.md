<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

/**
 * The demo writes the value straight onto <html> so the change is visible in the
 * components on this page without a rebuild, which is the point of a token layer
 * that resolves through var() at paint time.
 */
const DEFAULTS = {
  raised: '#FFFFFF',
  ink: '#15181F',
  control: '#E7EAEF',
  accent: '#2F6FE4',
  line: '#DDE1E7',
  radius: '12px',
}

const draft = ref({ ...DEFAULTS })
const applied = ref(false)
const text = ref('Token override')
const on = ref(true)

const tokens = computed(() => [
  { name: '--p0seid0n-raised', key: 'raised', note: 'panel background' },
  { name: '--p0seid0n-ink', key: 'ink', note: 'primary text and primary fill' },
  { name: '--p0seid0n-control', key: 'control', note: 'secondary fill' },
  { name: '--p0seid0n-line', key: 'line', note: 'borders and separators' },
  { name: '--p0seid0n-download', key: 'accent', note: 'exposed as --color-accent' },
  { name: '--p0seid0n-radius-control', key: 'radius', note: 'control radius' },
])

onMounted(() => {
  const root = document.documentElement
  applied.value = root.dataset.tokensApplied === 'true'
})

function apply(): void {
  const root = document.documentElement
  for (const token of tokens.value) {
    root.style.setProperty(token.name, draft.value[token.key as keyof typeof DEFAULTS])
  }
  root.dataset.tokensApplied = 'true'
  applied.value = true
}

function reset(): void {
  const root = document.documentElement
  for (const token of tokens.value) root.style.removeProperty(token.name)
  delete root.dataset.tokensApplied
  draft.value = { ...DEFAULTS }
  applied.value = false
}
</script>

# Theme and tokens

Nine semantic colours, three radii and one shadow. Nothing else is hard-coded in
the components, so every one of these values is a supported override point.

## The token layer

```css
:root {
  color-scheme: light dark;

  --p0seid0n-surface: light-dark(#F5F6F8, #121419);
  --p0seid0n-raised: light-dark(#FFFFFF, #1A1D24);
  --p0seid0n-ink: light-dark(#15181F, #ECEEF2);
  /* ... */
}
```

Each colour is written once with `light-dark()`, and `color-scheme` decides which
half applies. Adding `.light` or `.dark` to `<html>` pins the choice; leaving both
off follows the operating system. There is no `dark:` variant anywhere in the
components, so a token cannot be updated in one mode and forgotten in the other.

## Colour tokens

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| `--p0seid0n-surface` | `#F5F6F8` | `#121419` | page background |
| `--p0seid0n-raised` | `#FFFFFF` | `#1A1D24` | panels, menus, dialogs |
| `--p0seid0n-ink` | `#15181F` | `#ECEEF2` | primary text, primary fill |
| `--p0seid0n-ink-muted` | `#5B6270` | `#969CAA` | secondary text |
| `--p0seid0n-ink-faint` | `#A3A9B5` | `#5E6473` | tertiary text, empty values |
| `--p0seid0n-line` | `#DDE1E7` | `#2A2E37` | borders, separators |
| `--p0seid0n-control` | `#E7EAEF` | `#2B303A` | secondary fill, inputs, tabs |
| `--p0seid0n-download` | `#2F6FE4` | `#5B8DEF` | `--color-accent` |
| `--p0seid0n-upload` | `#C8731A` | `#C97C26` | `--color-accent-alt` |

The two accent names carry the source palette; components use the generic
`--color-accent` and `--color-accent-alt` so the motif is not tied to a product
vocabulary.

::: warning Danger is derived, not raw
`--color-accent-alt` on its own reaches only 3.28:1 against surface text. The
`danger` fill is a separate token, `--p0seid0n-danger`, defined as
`color-mix(in oklab, var(--p0seid0n-upload) 80%, var(--p0seid0n-ink))`, which
measures 4.61:1 in light and 7.07:1 in dark. The nine source colours above are
untouched.
:::

## Change a token and watch it apply

The controls below write the values onto `<html>` at runtime. Everything on this
page that uses those tokens repaints immediately, including the components in the
preview. Nothing is rebuilt.

<div class="my-4 grid gap-3 sm:grid-cols-2">
  <label v-for="token in tokens" :key="token.name" class="flex flex-col gap-1">
    <span class="text-[12px] font-medium text-ink-muted"><code>{{ token.name }}</code></span>
    <input
      v-model="draft[token.key as keyof typeof DEFAULTS]"
      type="text"
      class="h-9 rounded-control border border-line bg-control px-2 font-mono text-[12px] text-ink"
    />
    <span class="text-[11px] text-ink-faint">{{ token.note }}</span>
  </label>
</div>

<div class="mb-6 flex flex-wrap gap-2">
  <Button size="sm" @click="apply">Apply</Button>
  <Button size="sm" variant="ghost" :disabled="!applied" @click="reset">Reset</Button>
  <Badge :variant="applied ? 'accent' : 'outline'">{{ applied ? 'overridden' : 'defaults' }}</Badge>
</div>

<div class="example-surface">
  <div class="flex flex-wrap items-center gap-3">
    <Button>Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="danger">Danger</Button>
    <Badge variant="accent">accent</Badge>
    <Switch v-model="on" aria-label="Toggle" />
  </div>
  <Separator class="my-4" />
  <Card class="max-w-sm">
    <CardHeader><template #title>Raised panel</template></CardHeader>
    <CardContent><Input v-model="text" /></CardContent>
  </Card>
</div>

## Radii and shadow

| Token | Default | Utility |
| --- | --- | --- |
| `--p0seid0n-radius-control` | `12px` | `rounded-control` |
| `--p0seid0n-radius-panel` | `16px` | `rounded-panel` |
| `--p0seid0n-radius-panel-lg` | `20px` | `rounded-panel-lg` |
| `--p0seid0n-shadow-popup` | `0 12px 32px -8px` | `shadow-popup` |

## shadcn aliases

An optional second item maps the shadcn names onto the same variables, so a
project that already uses `--background` and `--foreground` keeps working. It adds
no new values:

```css
@theme inline {
  --color-background: var(--p0seid0n-surface);
  --color-foreground: var(--p0seid0n-ink);
  --color-card: var(--p0seid0n-raised);
  --color-primary: var(--p0seid0n-ink);
  --color-muted-foreground: var(--p0seid0n-ink-muted);
  --color-border: var(--p0seid0n-line);
  --color-input: var(--p0seid0n-line);
  --color-ring: var(--p0seid0n-ink);
}
```

Next: [typography and breakpoints](/guide/typography).
