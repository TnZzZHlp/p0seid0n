---
title: Dropdown menu
---

<script setup lang="ts">
import DropdownMenuItems from '../../examples/dropdown-menu-items.vue'
</script>

# Dropdown menu

A menu built on reka-ui, styled to the reference popup: 16px radius, 1px border,
6px inset and the popup shadow.

<Example name="dropdown-menu-items"><DropdownMenuItems /></Example>

## Keyboard

| Key | Behaviour |
| --- | --- |
| ArrowDown on the trigger | opens and focuses the first item |
| ArrowUp / ArrowDown | moves between items, skipping disabled ones |
| Enter | selects the item and closes |
| Escape | closes and returns focus to the trigger |

Clicking outside closes it too, and focus goes back to the trigger.

## Item types

| Component | Role | Selection |
| --- | --- | --- |
| `DropdownMenuItem` | `menuitem` | fires `select` |
| `DropdownMenuCheckboxItem` | `menuitemcheckbox` | `v-model` boolean |
| `DropdownMenuRadioItem` | `menuitemradio` | inside `DropdownMenuRadioGroup` |

The checkbox and radio items render an indicator on the left through
`DropdownMenuItemIndicator`, mounted only while checked. Override it with the
`indicator` slot.

## Trigger

Use `as-child` to wrap an existing control instead of rendering a bare button:

```vue
<DropdownMenuTrigger as-child>
  <Button variant="secondary">Actions</Button>
</DropdownMenuTrigger>
```

## API

| Prop | On | Type | Default |
| --- | --- | --- | --- |
| `modal` | `DropdownMenu` | boolean | `false` |
| `as` / `asChild` | `DropdownMenuTrigger` | element | `button` |
| `align` | `DropdownMenuContent` | `start` \| `center` \| `end` | `start` |
| `side` | `DropdownMenuContent` | `top` \| `right` \| `bottom` \| `left` | `bottom` |
| `sideOffset` | `DropdownMenuContent` | number | `8` |
| `minWidth` | `DropdownMenuContent` | number \| string | `160` |
| `disabled` | items | boolean | `false` |
