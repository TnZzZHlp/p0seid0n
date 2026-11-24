---
layout: home
hero:
  name: P0seid0n
  text: A Vue UI registry
  tagline: Install the source, own the styles.
  actions:
    - theme: brand
      text: Get started
      link: /guide/install
    - theme: alt
      text: Browse components
      link: /components/button
features:
  - title: Source, not a dependency
    details: "Every component arrives as a .vue file in your project. Edit it, delete what you do not use, keep your own git history."
  - title: One token layer
    details: "Nine semantic colours, three radii and one shadow. Overriding any --p0seid0n-* value re-themes every component, at build time or in the browser."
  - title: Light and dark from one value
    details: "Tokens are written once with light-dark(). No dark: variants to keep in sync, and no duplicated palette to drift."
---

## What this is

A registry of Vue 3 components plus the tokens they are built from. You install
files into your own project with the shadcn-vue CLI, or with the bundled
installer, and then you own them.

The visual language comes from a speed-test interface: two background layers,
three text levels, condensed numerals, a 12/16/20 radius scale and breakpoints at
640 and 1024. The component APIs are generic: `primary`, `secondary`, `ghost`,
`danger`, not `download` and `upload`.

## What it is not

- Not a bundled component package. The installed source declares its own npm dependencies.
- Not a theme system with `dark:` variants. Dark mode is a token value.
- Not an icon set. Components take slots and ship no icons.

Continue with [Install](/guide/install) to add the first component.
