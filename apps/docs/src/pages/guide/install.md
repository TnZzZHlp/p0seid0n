---
title: Install
---

# Install

Two ways in: the bundled installer used by this site, or the shadcn-vue CLI
pointed at a published registry. Both read the same `components.json` and write
the same files.

## Requirements

- Vue 3.5 or newer
- Tailwind CSS v4
- A `@/*` path alias pointing at your source root

## Add the tokens first

Every component references semantic classes such as `bg-raised` and `text-ink`,
so the token layer has to exist before anything renders correctly. Install the
`theme` item and import it once, in the same file that imports Tailwind:

```css
/* src/styles/app.css */
@import 'tailwindcss';
@import './p0seid0n.css';
```

`p0seid0n.css` declares the `--p0seid0n-*` variables, the `@theme inline` bridge
that turns them into utilities, and a `color-scheme` switch. Skip the import and
classes like `bg-raised` resolve to nothing.

## Install a component

```bash
npx shadcn-vue@latest add <registry-url>/r/button.json
```

The CLI reads `registryDependencies` and pulls in `theme` and `utils` as well, so
one command is enough. Items listed by bare name resolve to the registry that
served the entry, which is why `theme` has to be reachable at `/r/theme.json`.

This repository uses the bundled installer instead (`pnpm ui:install`), which
reads `apps/docs/public/r/registry.json` and writes every item into the site at
once.

::: tip Comparing the two
The bundled installer resolves aliases from this repo's `components.json` and
refuses to overwrite a file whose content differs. The upstream CLI is the path a
consumer takes; this site installs through the local script so that
`pnpm docs:build` itself verifies the registry output.
:::

## What lands in your project

```text
components.json        alias and CSS entry (init writes it)
src/styles/p0seid0n.css    tokens, installed by the theme item
src/lib/utils.ts       cn(), installed by the utils item
src/components/ui/     one folder per component, each with an index.ts
```

`registry:ui` items go to `aliases.ui`, `registry:lib` to `aliases.lib`, and the
theme item carries an explicit `target` because it is a plain CSS file.

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
