---
title: Theme switcher
---

<script setup lang="ts">
import ThemeSwitcherBasic from '../../examples/theme-switcher-basic.vue'
</script>

# Theme switcher

A three-state appearance menu (`system`, `light`, `dark`) built from the ghost
`Button` and `DropdownMenu` primitives, paired with `ThemeProvider` and a
first-paint `<head>` script.

<Example name="theme-switcher-basic"><ThemeSwitcherBasic /></Example>

## Setup

Install `theme-switcher` — its `registryDependencies` automatically bring in
`theme-provider`, `button`, `dropdown-menu`, `utils` and `theme`:

```bash
npx p0seid0n add theme-switcher
```

Wrap your app root in `ThemeProvider` and inline `themeScript()` in `<head>`
before the main bundle so reloads never flash the wrong scheme:

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ThemeProvider } from '@/components/ui/theme-provider'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
</script>

<template>
  <ThemeProvider default-theme="system">
    <header>
      <ThemeSwitcher />
    </header>
    <RouterView />
  </ThemeProvider>
</template>
```

```ts
import { themeScript } from '@/components/ui/theme-provider'

// Inject into index.html <head> or SSR head metadata:
const inlineHeadScript = themeScript()
```

## How storage behaves

- Selecting `light` or `dark` adds `.light` or `.dark` and `data-theme` to
  `<html>` and persists the choice under `storageKey` (`p0seid0n-theme` by
  default).
- Selecting `system` removes both classes so `:root { color-scheme: light dark }`
  follows the operating system in real time, and clears `localStorage` when
  `defaultTheme` is `'system'`.
- Operating system preference changes update `resolvedTheme` without writing to
  `localStorage`.

## API

| Prop | On | Type | Default |
| --- | --- | --- | --- |
| `defaultTheme` | `ThemeProvider` | `'system'` \| `'light'` \| `'dark'` | `'system'` |
| `storageKey` | `ThemeProvider` | string | `'p0seid0n-theme'` |
| `attribute` | `ThemeProvider` | string | `'data-theme'` |
| `label` | `ThemeSwitcher` | string | `'Appearance'` |
| `labels` | `ThemeSwitcher` | `Record<ThemeChoice, string>` | System / Light / Dark |

`useTheme()` returns `{ theme, resolvedTheme, setTheme, systemTheme, storageKey }`.
Slot on `ThemeSwitcher`: `icon` (receives `{ theme }`).
