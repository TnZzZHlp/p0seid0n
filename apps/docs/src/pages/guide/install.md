---
title: Install
---

# Install

Components are copied straight into your project as `.vue` and `.ts` source
files. Use the `p0seid0n` CLI for a two-command setup, or point the upstream
`shadcn-vue` CLI at a hosted registry URL. Both read the same `components.json`
and write the same files.

## Requirements

- Vue 3.5 or newer
- Tailwind CSS v4
- A path alias in `tsconfig.json` (or `tsconfig.app.json`), such as
  `"@/*": ["./src/*"]`

## Quick start with the p0seid0n CLI

Initialise `components.json` once at the root of your project, then add any
component by name:

```bash
npx p0seid0n init
npx p0seid0n add button card dialog
```

`add` resolves `registryDependencies` recursively, pulls in `theme` and `utils`,
rewrites `@/...` imports to match your configured `aliases`, and installs missing
npm dependencies with your project's package manager. Interactive components
use ui-sdk or Reka UI; their styles come from the registry.

Then import the token stylesheet once, in the same file that imports Tailwind:

```css
/* src/styles/app.css */
@import 'tailwindcss';
@import './p0seid0n.css';
```

`p0seid0n.css` declares the `--p0seid0n-*` variables, the `@theme inline` bridge
that turns them into utilities, and a `color-scheme` switch. Skip the import and
classes like `bg-raised` resolve to nothing.

## Using the upstream shadcn-vue CLI

Every item in `/r/*.json` also conforms to the upstream `registry-item.json`
schema:

```bash
npx shadcn-vue@latest add https://p0seid0n.tnzzzhlp.workers.dev/r/button.json
```

Items listed by bare name resolve to the registry that served the entry, which is
why `theme` and `utils` live alongside the components under `/r/`.

This documentation site uses the repository's local installer (`pnpm ui:install`),
which reads `apps/docs/public/r/registry.json` and stages every item into `src/`
so `pnpm docs:build` itself verifies the registry output.

## What lands in your project

```text
components.json            alias and CSS entry (init writes it)
src/styles/p0seid0n.css    tokens, installed by the theme item
src/lib/utils.ts           cn(), installed by the utils item
src/components/ui/         one folder per component, each with an index.ts
```

`registry:ui` items go to `aliases.ui`, `registry:lib` goes to `aliases.lib` (or
`aliases.utils` for `utils.ts`), and `registry:file` items with a `target` land
relative to your alias root.

## Why a folder per component

Each component is a directory rather than a single file:

- variants live in `variants.ts`, so a `.vue` file does not have to be edited to
  change a class
- `index.ts` is the import surface, which keeps your imports stable if the files
  inside are reorganised

```ts
import { Button } from '@/components/ui/button'
```

## Adding your own

Nothing stops you changing an installed file: it is your source now. Two things
are worth leaving alone:

- the `--color-*` names, since other components may reference the same token
- the `outline-solid` in focus rings: `outline-none` sets
  `--tw-outline-style: none`, and `outline-2` alone would leave the ring invisible

Next: [theme and tokens](/guide/theme).
