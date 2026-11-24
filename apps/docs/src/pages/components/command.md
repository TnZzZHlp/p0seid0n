---
title: Command
---

<script setup lang="ts">
import CommandBasic from '../../examples/command-basic.vue'
</script>

# Command

A searchable command palette built on ui-sdk's `Command` primitive, with an
optional `CommandDialog` modal wrapper.

<Example name="command-basic"><CommandBasic /></Example>

## Filtering and keywords

Typing into `CommandInput` filters `CommandItem` rows case-insensitively
against both `value` and any extra `keywords` terms. Empty `CommandGroup`
sections hide automatically while keeping their items mounted so clearing the
search restores every choice immediately, and `CommandEmpty` appears when no
items match.

Set `filterDisabled` on `Command` to supply server-side or custom filtering.

## Keyboard

| Key | Behaviour |
| --- | --- |
| ArrowUp / ArrowDown | moves highlight through matching enabled items |
| Home / End | jumps to the first or last matching item |
| Enter | selects the highlighted item and fires `select` |
| Escape (inside `CommandDialog`) | closes the dialog unless `closeOnEsc` is false |

## API

| Prop | On | Type | Default |
| --- | --- | --- | --- |
| `modelValue` | `Command` | `string \| string[]` | — |
| `searchTerm` (`v-model:searchTerm`) | `Command` | string | `''` |
| `filterDisabled` | `Command` | boolean | `false` |
| `loop` | `Command` | boolean | `true` |
| `multiple` | `Command` | boolean | `false` |
| `disabled` | `Command` \| `CommandItem` | boolean | `false` |
| `open` (`v-model:open`) | `CommandDialog` | boolean | — |
| `defaultOpen` | `CommandDialog` | boolean | — |
| `autoFocus` | `CommandInput` | boolean | `false` |
| `heading` | `CommandGroup` | string | — |
| `value` | `CommandItem` | string | required |
| `keywords` | `CommandItem` | `string[]` | — |
