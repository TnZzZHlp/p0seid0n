import { existsSync } from 'node:fs'
import { isAbsolute, join, relative, resolve, sep } from 'node:path'

export const ITEM_TYPES = [
  'registry:lib',
  'registry:block',
  'registry:component',
  'registry:ui',
  'registry:hook',
  'registry:theme',
  'registry:page',
  'registry:file',
  'registry:style',
  'registry:base',
  'registry:font',
  'registry:item',
] as const

/** Types that the upstream schema requires a `target` for. */
const TARGET_REQUIRED_TYPES = new Set(['registry:file', 'registry:page'])

export type FileEntry = {
  path: string
  type: string
  target?: string
}

export type Item = {
  name: string
  type: string
  title?: string
  description?: string
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  files?: FileEntry[]
  docs?: string
}

export type Manifest = {
  name: string
  homepage: string
  items: Item[]
}

export class BuildError extends Error {}

function fail(subject: string, field: string, message: string): never {
  throw new BuildError(`${subject}: ${field} ${message}`)
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//.test(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isInsideRoot(root: string, candidate: string): boolean {
  const rel = relative(resolve(root), resolve(candidate))
  if (rel === '') return false
  if (isAbsolute(rel)) return false
  return !rel.split(sep).includes('..')
}

function assertStringArray(subject: string, field: string, value: unknown): void {
  if (value === undefined) return
  if (!Array.isArray(value)) fail(subject, field, 'must be an array')
  for (const [index, entry] of value.entries()) {
    if (!isNonEmptyString(entry)) {
      fail(subject, `${field}[${index}]`, 'must be a non-empty string')
    }
  }
}

/**
 * Validates the manifest structure and filesystem references.
 *
 * Errors name both the item and the offending field so a failure points at
 * an actionable location rather than at the manifest as a whole.
 */
export function validateManifest(manifest: unknown, registryRoot: string): Manifest {
  if (typeof manifest !== 'object' || manifest === null) {
    throw new BuildError('manifest: expected a JSON object')
  }

  const root = manifest as Record<string, unknown>

  if (!isNonEmptyString(root.name)) fail('manifest', 'name', 'is required')
  if (!isNonEmptyString(root.homepage)) fail('manifest', 'homepage', 'is required')
  if (!Array.isArray(root.items)) fail('manifest', 'items', 'is required')

  const items = root.items as unknown[]
  if (items.length === 0) fail('manifest', 'items', 'must contain at least one item')

  const byName = new Map<string, Record<string, unknown>>()
  for (const [index, raw] of items.entries()) {
    if (typeof raw !== 'object' || raw === null) {
      fail('manifest', `items[${index}]`, 'must be an object')
    }
    const item = raw as Record<string, unknown>
    const subject = isNonEmptyString(item.name) ? `item "${item.name}"` : `items[${index}]`

    if (!isNonEmptyString(item.name)) fail(subject, 'name', 'is required')
    const name = item.name as string
    if (byName.has(name)) fail(subject, 'name', 'is duplicated in the manifest')
    byName.set(name, item)

    if (!isNonEmptyString(item.type)) fail(subject, 'type', 'is required')
    const type = item.type as string
    if (!(ITEM_TYPES as readonly string[]).includes(type)) {
      fail(subject, 'type', `"${type}" is not a known registry item type`)
    }

    if (item.title !== undefined && !isNonEmptyString(item.title)) {
      fail(subject, 'title', 'must be a non-empty string')
    }
    if (item.description !== undefined && !isNonEmptyString(item.description)) {
      fail(subject, 'description', 'must be a non-empty string')
    }
    if (item.docs !== undefined && typeof item.docs !== 'string') {
      fail(subject, 'docs', 'must be a string')
    }

    assertStringArray(subject, 'dependencies', item.dependencies)
    assertStringArray(subject, 'devDependencies', item.devDependencies)
    assertStringArray(subject, 'registryDependencies', item.registryDependencies)

    if (!Array.isArray(item.files)) fail(subject, 'files', 'is required')
    const files = item.files as unknown[]
    if (files.length === 0) fail(subject, 'files', 'must contain at least one file')

    for (const [fileIndex, rawFile] of files.entries()) {
      const fileField = `files[${fileIndex}]`
      if (typeof rawFile !== 'object' || rawFile === null) {
        fail(subject, fileField, 'must be an object')
      }
      const file = rawFile as Record<string, unknown>

      if (!isNonEmptyString(file.path)) fail(subject, `${fileField}.path`, 'is required')
      if (!isNonEmptyString(file.type)) fail(subject, `${fileField}.type`, 'is required')

      const fileType = file.type as string
      if (!(ITEM_TYPES as readonly string[]).includes(fileType)) {
        fail(subject, `${fileField}.type`, `"${fileType}" is not a known registry item type`)
      }

      if (file.target !== undefined) {
        if (!isNonEmptyString(file.target)) {
          fail(subject, `${fileField}.target`, 'must be a non-empty string')
        }
        const target = file.target as string
        if (target.startsWith('/') || target.includes('..')) {
          fail(subject, `${fileField}.target`, `"${target}" must be a relative path without ".."`)
        }
      } else if (TARGET_REQUIRED_TYPES.has(fileType)) {
        fail(subject, `${fileField}.target`, `is required for type "${fileType}"`)
      }

      const sourcePath = file.path as string
      if (sourcePath.startsWith('/') || sourcePath.includes('..')) {
        fail(subject, `${fileField}.path`, `"${sourcePath}" must be a relative path without ".."`)
      }
      const resolved = join(registryRoot, sourcePath)
      if (!isInsideRoot(registryRoot, resolved) || !existsSync(resolved)) {
        fail(subject, `${fileField}.path`, `"${sourcePath}" does not exist under registry/`)
      }
    }
  }

  // Registry dependencies are checked after all names are known so forward
  // references within one manifest are allowed.
  for (const [name, record] of byName) {
    const deps = record.registryDependencies
    if (!Array.isArray(deps)) continue
    for (const [index, dep] of deps.entries()) {
      if (typeof dep !== 'string') continue
      if (isHttpUrl(dep)) continue
      if (dep === name) {
        fail(
          `item "${name}"`,
          `registryDependencies[${index}]`,
          'must not reference the item itself',
        )
      }
      if (!byName.has(dep)) {
        fail(
          `item "${name}"`,
          `registryDependencies[${index}]`,
          `"${dep}" is not defined in this manifest`,
        )
      }
    }
  }

  const visited = new Set<string>()
  const visiting: string[] = []
  function checkCycles(name: string): void {
    if (visited.has(name)) return
    const cycleStart = visiting.indexOf(name)
    if (cycleStart !== -1) {
      const cycle = [...visiting.slice(cycleStart), name].join(' -> ')
      fail(`item "${visiting[cycleStart]}"`, 'registryDependencies', `forms a cycle: ${cycle}`)
    }
    visiting.push(name)
    const deps = byName.get(name)?.registryDependencies
    if (Array.isArray(deps)) {
      for (const dep of deps) {
        if (typeof dep === 'string' && !isHttpUrl(dep)) checkCycles(dep)
      }
    }
    visiting.pop()
    visited.add(name)
  }
  for (const name of byName.keys()) checkCycles(name)

  return manifest as Manifest
}
