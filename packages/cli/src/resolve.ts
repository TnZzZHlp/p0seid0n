import { dirname, isAbsolute, join, resolve } from 'node:path'

import { CliError } from './errors.ts'
import { readJson, readText } from './fs.ts'

export type RegistryFile = {
  path: string
  type: string
  target?: string
  content?: string
}

export type RegistryItem = {
  name: string
  type: string
  title?: string
  description?: string
  docs?: string
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  files: RegistryFile[]
}

export type ItemRef =
  { kind: 'name'; value: string } | { kind: 'url'; value: string } | { kind: 'file'; value: string }

const NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/

export function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

/**
 * Classifies one `add` argument. A bare word is a registry name; anything with a
 * scheme is fetched directly; everything else is treated as a path on disk.
 */
export function parseRef(value: string, cwd: string): ItemRef {
  if (isUrl(value)) return { kind: 'url', value }
  if (
    value.startsWith('.') ||
    value.startsWith('/') ||
    isAbsolute(value) ||
    value.endsWith('.json')
  ) {
    return { kind: 'file', value: resolve(cwd, value) }
  }
  if (!NAME_PATTERN.test(value)) {
    throw new CliError(
      `"${value}" is not a registry name, a URL or a path; names are lowercase letters, digits and dashes`,
    )
  }
  return { kind: 'name', value }
}

export type Context = { kind: 'dir'; base: string } | { kind: 'http'; base: string }

function normalizeHttpBase(url: string): string {
  const trimmed = url.replace(/\/+$/, '')
  return trimmed.endsWith('/r') ? trimmed.slice(0, -2) : trimmed
}

export function contextFor(ref: ItemRef, registry: string): Context {
  if (ref.kind === 'url') {
    // A dependency of a URL item is fetched from the same registry root.
    const stripped = ref.value.replace(/\/[^/]+\.json$/, '')
    return { kind: 'http', base: normalizeHttpBase(stripped) }
  }
  if (ref.kind === 'file') return { kind: 'dir', base: dirname(ref.value) }
  if (isUrl(registry)) return { kind: 'http', base: normalizeHttpBase(registry) }
  return { kind: 'dir', base: resolve(registry) }
}

export function itemUrl(context: Context, name: string): string {
  if (context.kind === 'http') return `${context.base}/r/${name}.json`
  return join(context.base, `${name}.json`)
}

const TIMEOUT_MS = 10_000

async function fetchJsonOnce(url: string): Promise<RegistryItem> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new CliError(`GET ${url} returned ${response.status} ${response.statusText}`)
    }
    return (await response.json()) as RegistryItem
  } finally {
    clearTimeout(timer)
  }
}

/** One retry, then the failure is reported with the URL that was requested. */
async function fetchJson(url: string): Promise<RegistryItem> {
  try {
    return await fetchJsonOnce(url)
  } catch (first) {
    try {
      return await fetchJsonOnce(url)
    } catch (second) {
      const reason = second instanceof Error ? second.message : String(second)
      const firstReason = first instanceof Error ? first.message : String(first)
      throw new CliError(
        `could not read ${url}\n  first attempt: ${firstReason}\n  retry: ${reason}`,
      )
    }
  }
}

function validateItem(item: RegistryItem, origin: string): RegistryItem {
  if (!item?.name) throw new CliError(`${origin} has no "name"`)
  if (!Array.isArray(item.files) || item.files.length === 0) {
    throw new CliError(`item "${item.name}" in ${origin} declares no files`)
  }
  for (const file of item.files) {
    if (!file.path || typeof file.content !== 'string') {
      throw new CliError(`item "${item.name}" in ${origin} has a file without path or content`)
    }
  }
  return item
}

export async function readItem(ref: ItemRef, context: Context): Promise<RegistryItem> {
  if (ref.kind === 'url') {
    return validateItem(await fetchJson(ref.value), ref.value)
  }
  if (ref.kind === 'file') {
    const text = readText(ref.value)
    if (text === null) throw new CliError(`no registry file at ${ref.value}`)
    let parsed: RegistryItem
    try {
      parsed = JSON.parse(text) as RegistryItem
    } catch {
      throw new CliError(`${ref.value} is not valid JSON`)
    }
    return validateItem(parsed, ref.value)
  }
  if (context.kind === 'http') {
    return validateItem(await fetchJson(itemUrl(context, ref.value)), itemUrl(context, ref.value))
  }
  const path = join(context.base, `${ref.value}.json`)
  const parsed = readJson<RegistryItem>(path)
  if (parsed === null) {
    throw new CliError(`registry item "${ref.value}" is missing at ${path}`)
  }
  return validateItem(parsed, path)
}

export type ResolvedItem = {
  item: RegistryItem
  /** Origin used to resolve this item's own dependencies. */
  context: Context
}

export type Plan = {
  /** Dependencies first, so writing in order never references a missing file. */
  items: ResolvedItem[]
}

function canonicalKey(ref: ItemRef, context: Context): string {
  if (ref.kind === 'url') return `url:${ref.value}`
  if (ref.kind === 'file') return `file:${ref.value}`
  if (context.kind === 'dir') return `file:${join(context.base, `${ref.value}.json`)}`
  return `url:${itemUrl(context, ref.value)}`
}

function displayKey(key: string): string {
  return key.replace(/^(url|file):/, '')
}

function dependencyRef(
  value: string,
  parent: Context,
  cwd: string,
): { ref: ItemRef; context: Context } {
  if (isUrl(value)) {
    const ref: ItemRef = { kind: 'url', value }
    return { ref, context: contextFor(ref, '') }
  }
  const looksLikePath = value.startsWith('.') || value.startsWith('/') || value.endsWith('.json')
  if (looksLikePath) {
    const base = parent.kind === 'dir' ? parent.base : cwd
    const absolute = resolve(base, value)
    const ref: ItemRef = { kind: 'file', value: absolute }
    return { ref, context: contextFor(ref, '') }
  }
  return { ref: { kind: 'name', value }, context: parent }
}

/**
 * Walks `registryDependencies` depth-first and returns items in install order.
 * A name is resolved against the context that served its dependent, which is what
 * lets a self-hosted registry refer to its own items by bare name.
 */
export async function resolvePlan(refs: ItemRef[], registry: string, cwd: string): Promise<Plan> {
  const done = new Map<string, ResolvedItem>()
  const visiting: string[] = []

  async function visit(ref: ItemRef, context: Context): Promise<void> {
    const key = canonicalKey(ref, context)
    if (done.has(key)) return
    if (visiting.includes(key)) {
      const cycle = [...visiting.slice(visiting.indexOf(key)), key].map(displayKey).join(' -> ')
      throw new CliError(`registry dependencies form a cycle: ${cycle}`)
    }
    visiting.push(key)
    const item = await readItem(ref, context)
    for (const dependency of item.registryDependencies ?? []) {
      const nested = dependencyRef(dependency, context, cwd)
      await visit(nested.ref, nested.context)
    }
    visiting.pop()
    done.set(key, { item, context })
  }

  for (const ref of refs) {
    await visit(ref, contextFor(ref, registry))
  }
  return { items: [...done.values()] }
}

export function emptyPlan(): Plan {
  return { items: [] }
}

/** Kept for callers that need the resolved file list without writing anything. */
export function planFileCount(plan: Plan): number {
  return plan.items.reduce((total, entry) => total + entry.item.files.length, 0)
}
