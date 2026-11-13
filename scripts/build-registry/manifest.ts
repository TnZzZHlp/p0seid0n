import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Item, Manifest } from './validate.ts'

export type RegistryIndexEntry = {
  name: string
  type: string
  title?: string
  description?: string
}

export type RegistrySummary = {
  name: string
  homepage: string
  items: { name: string; type: string; title?: string }[]
}

export type ItemPayload = {
  name: string
  type: string
  title?: string
  description?: string
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  files: { path: string; type: string; target?: string; content: string }[]
  docs?: string
}

/** Everything in an item payload except the inlined file contents. */
export type ItemPayloadMeta = Omit<ItemPayload, 'files'>

/**
 * Builds the distributable payload for one item, inlining file contents.
 *
 * Key order is fixed rather than derived from the manifest so that repeated
 * builds of unchanged input are byte-identical.
 */
export function buildItemPayload(item: Item, registryRoot: string): ItemPayload {
  const meta: ItemPayloadMeta = { name: item.name, type: item.type }
  if (item.title !== undefined) meta.title = item.title
  if (item.description !== undefined) meta.description = item.description
  if (item.dependencies !== undefined) meta.dependencies = [...item.dependencies]
  if (item.devDependencies !== undefined) meta.devDependencies = [...item.devDependencies]
  if (item.registryDependencies !== undefined) {
    meta.registryDependencies = [...item.registryDependencies]
  }
  if (item.docs !== undefined) meta.docs = item.docs

  const files: ItemPayload['files'] = (item.files ?? []).map((file) => {
    const content = readFileSync(join(registryRoot, file.path), 'utf8')
    const entry: ItemPayload['files'][number] = {
      path: file.path,
      type: file.type,
      content,
    }
    if (file.target !== undefined) entry.target = file.target
    return entry
  })

  return { ...meta, files }
}

/** The minimal manifest used for cross-item dependency resolution. */
export function buildRegistrySummary(manifest: Manifest): RegistrySummary {
  return {
    name: manifest.name,
    homepage: manifest.homepage,
    items: manifest.items.map((item) => {
      const entry: RegistrySummary['items'][number] = { name: item.name, type: item.type }
      if (item.title !== undefined) entry.title = item.title
      return entry
    }),
  }
}

/** The flat listing used by the docs index and CLI search. */
export function buildRegistryIndex(manifest: Manifest): RegistryIndexEntry[] {
  return manifest.items.map((item) => {
    const entry: RegistryIndexEntry = { name: item.name, type: item.type }
    if (item.title !== undefined) entry.title = item.title
    if (item.description !== undefined) entry.description = item.description
    return entry
  })
}

/**
 * Merges every item into a single payload.
 *
 * Items keep their identity in the `items` array; only the file contents are
 * inlined. Q01 decides later whether this becomes the `add all` source.
 */
export function buildAllPayload(
  manifest: Manifest,
  registryRoot: string,
): {
  name: string
  homepage: string
  items: ItemPayload[]
} {
  return {
    name: manifest.name,
    homepage: manifest.homepage,
    items: manifest.items.map((item) => buildItemPayload(item, registryRoot)),
  }
}

export function serialize(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}
