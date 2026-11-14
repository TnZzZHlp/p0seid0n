import { join } from 'node:path'

import { CliError } from './errors.ts'
import { readJson } from './fs.ts'

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
      utils: aliases.utils ?? DEFAULT_CONFIG.aliases.utils,
    },
    ...(parsed.registries ? { registries: parsed.registries } : {}),
  }
}

type TsConfigShape = {
  compilerOptions?: { baseUrl?: string; paths?: Record<string, string[]> }
  extends?: string | string[]
}

export type PathMapping = {
  /** Alias prefix as written, for example `@/`. */
  prefix: string
  /** Absolute directory the prefix maps to. */
  directory: string
}

/**
 * Reads `compilerOptions.paths` so `@/components/ui` can be turned into a real
 * directory. Only the single-target, prefix-plus-wildcard form is supported,
 * which is what every Vue starter uses; anything else is reported instead of
 * guessed.
 */
export function readPathMapping(cwd: string): PathMapping[] {
  const json =
    readJson<TsConfigShape>(join(cwd, 'tsconfig.json')) ??
    readJson<TsConfigShape>(join(cwd, 'jsconfig.json'))
  if (!json) return []
  const compilerOptions = json.compilerOptions ?? {}
  const baseUrl = compilerOptions.baseUrl ?? '.'
  const paths = compilerOptions.paths ?? {}
  const mappings: PathMapping[] = []
  for (const [pattern, targets] of Object.entries(paths)) {
    const target = targets[0]
    if (!target || targets.length > 1) continue
    const prefixMatch = /^(.+?)\*$/.exec(pattern)
    if (!prefixMatch) continue
    const prefix = prefixMatch[1]
    const directory = target.replace(/\*$/, '')
    mappings.push({ prefix, directory: join(cwd, baseUrl, directory) })
  }
  // Longest prefix first so `@/components/ui` wins over `@/`.
  return mappings.sort((a, b) => b.prefix.length - a.prefix.length)
}
