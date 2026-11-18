import { existsSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { CliError } from './errors.ts'
import { readJson, readJsonc } from './fs.ts'

export type Aliases = {
  components: string
  ui: string
  lib: string
  utils: string
}

export type ComponentsConfig = {
  style: string
  tailwind: {
    css: string
    baseColor: string
    cssVariables: boolean
  }
  aliases: Aliases
  /** Optional registry namespaces, matching the upstream `registries` field. */
  registries?: Record<string, string>
}

export const DEFAULT_CONFIG: ComponentsConfig = {
  style: 'p0seid0n',
  tailwind: { css: 'src/styles/p0seid0n.css', baseColor: 'neutral', cssVariables: true },
  aliases: {
    components: '@/components',
    ui: '@/components/ui',
    lib: '@/lib',
    utils: '@/lib/utils',
  },
}

export const CONFIG_FILE = 'components.json'

export function configPath(cwd: string): string {
  return join(cwd, CONFIG_FILE)
}

export function readConfig(cwd: string): ComponentsConfig {
  const path = configPath(cwd)
  const parsed = readJson<Partial<ComponentsConfig>>(path)
  if (parsed === null) {
    throw new CliError(`no ${CONFIG_FILE} in ${cwd}; run \`p0seid0n init\` first`)
  }
  const aliases = parsed.aliases
  if (!aliases?.ui || !aliases.lib) {
    throw new CliError(`${CONFIG_FILE} must declare aliases.ui and aliases.lib`)
  }
  return {
    style: parsed.style ?? DEFAULT_CONFIG.style,
    tailwind: { ...DEFAULT_CONFIG.tailwind, ...parsed.tailwind },
    aliases: {
      components: aliases.components ?? DEFAULT_CONFIG.aliases.components,
      ui: aliases.ui,
      lib: aliases.lib,
      utils: aliases.utils ?? `${aliases.lib.replace(/\/+$/, '')}/utils`,
    },
    ...(parsed.registries ? { registries: parsed.registries } : {}),
  }
}

type TsConfigShape = {
  compilerOptions?: { baseUrl?: string; paths?: Record<string, string[]> }
  extends?: string | string[]
  references?: { path?: string }[]
}

export type PathMapping = {
  /** Alias prefix as written, for example `@/`. */
  prefix: string
  /** Absolute directory the prefix maps to. */
  directory: string
}

function resolveTsConfigCandidate(baseDir: string, specifier: string): string | null {
  if (!specifier.startsWith('.') && !specifier.startsWith('/')) return null
  const direct = resolve(baseDir, specifier)
  if (existsSync(direct)) {
    try {
      if (statSync(direct).isDirectory()) {
        const nested = join(direct, 'tsconfig.json')
        return existsSync(nested) ? nested : null
      }
    } catch {
      return null
    }
    return direct
  }
  if (!direct.endsWith('.json') && existsSync(`${direct}.json`)) {
    return `${direct}.json`
  }
  return null
}

function extractMappingsFromFile(configFile: string, seen: Set<string>): PathMapping[] {
  const normalized = resolve(configFile)
  if (seen.has(normalized)) return []
  seen.add(normalized)

  const json = readJsonc<TsConfigShape>(normalized)
  if (!json) return []

  const configDir = dirname(normalized)
  const collected = new Map<string, string>()

  const parents = Array.isArray(json.extends) ? json.extends : json.extends ? [json.extends] : []
  for (const parentSpec of parents) {
    const parentPath = resolveTsConfigCandidate(configDir, parentSpec)
    if (!parentPath) continue
    for (const entry of extractMappingsFromFile(parentPath, seen)) {
      collected.set(entry.prefix, entry.directory)
    }
  }

  const compilerOptions = json.compilerOptions ?? {}
  const baseUrl = compilerOptions.baseUrl ?? '.'
  const paths = compilerOptions.paths ?? {}
  for (const [pattern, targets] of Object.entries(paths)) {
    const target = targets[0]
    if (!target || targets.length > 1) continue
    const prefixMatch = /^(.+?)\*$/.exec(pattern)
    if (!prefixMatch) continue
    const prefix = prefixMatch[1]
    const directory = target.replace(/\*$/, '')
    collected.set(prefix, resolve(configDir, baseUrl, directory))
  }

  if (collected.size === 0 && Array.isArray(json.references)) {
    for (const ref of json.references) {
      if (!ref?.path) continue
      const refPath = resolveTsConfigCandidate(configDir, ref.path)
      if (!refPath) continue
      for (const entry of extractMappingsFromFile(refPath, seen)) {
        if (!collected.has(entry.prefix)) {
          collected.set(entry.prefix, entry.directory)
        }
      }
    }
  }

  return [...collected.entries()]
    .map(([prefix, directory]) => ({ prefix, directory }))
    .sort((a, b) => b.prefix.length - a.prefix.length)
}

/**
 * Reads `compilerOptions.paths` so `@/components/ui` can be turned into a real
 * directory. Supports JSONC comments, relative `extends`, and solution-style
 * `references` (such as `create-vue`'s `tsconfig.app.json`).
 */
export function readPathMapping(cwd: string): PathMapping[] {
  const tsPath = join(cwd, 'tsconfig.json')
  if (existsSync(tsPath)) {
    return extractMappingsFromFile(tsPath, new Set())
  }
  const jsPath = join(cwd, 'jsconfig.json')
  if (existsSync(jsPath)) {
    return extractMappingsFromFile(jsPath, new Set())
  }
  return []
}
