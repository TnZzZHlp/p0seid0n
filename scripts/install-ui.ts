import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export class InstallError extends Error {}

export type ComponentsConfig = {
  aliases: { components?: string; ui: string; lib: string; utils: string }
  tailwind: { css: string }
}

export type RegistryFile = {
  path: string
  type: string
  target?: string
  content: string
}

export type RegistryItem = {
  name: string
  type: string
  files: RegistryFile[]
}

export type Conflict = {
  /** Absolute destination path. */
  path: string
  /** Why the file could not be written: content differs or the alias is unusable. */
  reason: 'differs' | 'outside-app' | 'unresolved-alias'
}

export type InstallPlan = {
  /** Destination to content, already merged across items. */
  writes: Map<string, string>
  /** Existing files replaced when `overwrite` is true. */
  updates: Map<string, string>
  /** Files whose content already matches; nothing to do. */
  unchanged: string[]
  conflicts: Conflict[]
}

export const DEFAULT_ALIAS_ROOT = {
  '@': 'src',
} as const

export function isInside(parent: string, child: string): boolean {
  const rel = relative(resolve(parent), resolve(child))
  if (rel === '') return true
  if (isAbsolute(rel)) return false
  return !rel.split(sep).includes('..')
}

/**
 * Expands an alias such as `@/components/ui` into a path under the app root.
 * The prefix comes from tsconfig in a consumer project; the docs site uses the
 * `@` -> `src` mapping declared here, and anything else is reported rather than
 * silently written somewhere unexpected.
 */
export function resolveAlias(alias: string, appRoot: string): string | null {
  const match = /^(@[^/]*)\/(.*)$/.exec(alias)
  if (!match) return null
  const [, prefix, rest] = match
  const root = DEFAULT_ALIAS_ROOT[prefix as keyof typeof DEFAULT_ALIAS_ROOT]
  if (!root) return null
  return rest ? join(appRoot, root, rest) : join(appRoot, root)
}

export function readConfig(appRoot: string): ComponentsConfig {
  const path = join(appRoot, 'components.json')
  let raw: string
  try {
    raw = readFileSync(path, 'utf8')
  } catch {
    throw new InstallError(`apps/docs/components.json could not be read at ${path}`)
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new InstallError(`apps/docs/components.json is not valid JSON (${message})`)
  }
  const config = parsed as Partial<ComponentsConfig>
  if (!config.aliases?.ui || !config.aliases.lib || !config.aliases.utils) {
    throw new InstallError('components.json must declare aliases.ui, aliases.lib and aliases.utils')
  }
  if (!config.tailwind?.css) {
    throw new InstallError('components.json must declare tailwind.css')
  }
  return config as ComponentsConfig
}

export function readManifest(sourceDir: string): { items: { name: string; type: string }[] } {
  const path = join(sourceDir, 'registry.json')
  let raw: string
  try {
    raw = readFileSync(path, 'utf8')
  } catch {
    throw new InstallError(
      `registry manifest missing at ${path}; run \`pnpm build:registry\` first`,
    )
  }
  const parsed = JSON.parse(raw) as { items?: { name: string; type: string }[] }
  if (!Array.isArray(parsed.items) || parsed.items.length === 0) {
    throw new InstallError(`${path} has no items`)
  }
  return { items: parsed.items }
}

export function readItem(sourceDir: string, name: string): RegistryItem {
  const path = join(sourceDir, `${name}.json`)
  let raw: string
  try {
    raw = readFileSync(path, 'utf8')
  } catch {
    throw new InstallError(`registry item "${name}" is missing at ${path}`)
  }
  const parsed = JSON.parse(raw) as Partial<RegistryItem>
  if (!Array.isArray(parsed.files) || parsed.files.length === 0) {
    throw new InstallError(`registry item "${name}" declares no files`)
  }
  return parsed as RegistryItem
}

function rewriteImports(content: string, filePath: string, config: ComponentsConfig): string {
  if (!/\.(vue|ts|tsx|js|jsx)$/.test(filePath)) return content
  const componentsAlias = config.aliases.components ?? '@/components'
  return content.replace(
    /((?:from|import)\s*\(?\s*['"])(@\/[^'"]+)(['"])/g,
    (full, lead: string, specifier: string, quote: string) => {
      if (specifier === '@/lib/utils') return `${lead}${config.aliases.utils}${quote}`
      if (specifier.startsWith('@/lib/')) {
        return `${lead}${config.aliases.lib}/${specifier.slice('@/lib/'.length)}${quote}`
      }
      if (specifier.startsWith('@/components/ui/')) {
        return `${lead}${config.aliases.ui}/${specifier.slice('@/components/ui/'.length)}${quote}`
      }
      if (specifier.startsWith('@/ui/')) {
        return `${lead}${config.aliases.ui}/${specifier.slice('@/ui/'.length)}${quote}`
      }
      if (specifier.startsWith('@/components/')) {
        return `${lead}${componentsAlias}/${specifier.slice('@/components/'.length)}${quote}`
      }
      return full
    },
  )
}

/**
 * The registry item type decides the destination folder, except for `registry:file`
 * items such as the theme. Their `target` follows the shadcn convention of living
 * under the alias root (`src/` here), not under the app directory itself.
 */
function destinationFor(
  file: RegistryFile,
  config: ComponentsConfig,
  appRoot: string,
): string | null {
  if (file.target) {
    const root = resolveAlias('@/', appRoot) ?? appRoot
    return join(root, file.target.replace(/^src\//, ''))
  }
  if (file.type === 'registry:lib') {
    if (file.path === 'lib/utils.ts' && config.aliases.utils) {
      const target = resolveAlias(config.aliases.utils, appRoot)
      return target ? (target.endsWith('.ts') ? target : `${target}.ts`) : null
    }
    const libDir = resolveAlias(config.aliases.lib, appRoot)
    return libDir ? join(libDir, file.path.split('/').pop() ?? file.path) : null
  }
  if (file.type === 'registry:ui') {
    const uiDir = resolveAlias(config.aliases.ui, appRoot)
    if (!uiDir) return null
    // ui/<name>/<file> maps onto <aliases.ui>/<name>/<file>.
    const nested = file.path.replace(/^ui\//, '')
    return join(uiDir, nested)
  }
  return null
}

/**
 * Builds the install plan without touching the filesystem, so `--check` and the
 * real run agree on what would happen.
 */
export function planInstall(
  sourceDir: string,
  appRoot: string,
  options: { overwrite?: boolean } = {},
): InstallPlan {
  const config = readConfig(appRoot)
  const manifest = readManifest(sourceDir)
  const plan: InstallPlan = { writes: new Map(), updates: new Map(), unchanged: [], conflicts: [] }
  const seen = new Set<string>()

  for (const entry of manifest.items) {
    const item = readItem(sourceDir, entry.name)
    for (const file of item.files) {
      const destination = destinationFor(file, config, appRoot)
      if (!destination) {
        plan.conflicts.push({ path: file.path, reason: 'unresolved-alias' })
        continue
      }
      if (!isInside(appRoot, destination)) {
        plan.conflicts.push({ path: destination, reason: 'outside-app' })
        continue
      }
      if (seen.has(destination)) continue
      seen.add(destination)

      const content = rewriteImports(file.content, file.path, config)
      const existing = readIfPresent(destination)
      if (existing === content) {
        plan.unchanged.push(destination)
        continue
      }
      if (existing !== null) {
        if (options.overwrite) {
          plan.updates.set(destination, content)
        } else {
          plan.conflicts.push({ path: destination, reason: 'differs' })
        }
        continue
      }
      plan.writes.set(destination, content)
    }
  }

  return plan
}

function readIfPresent(path: string): string | null {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return null
  }
}

export function applyPlan(plan: InstallPlan): {
  written: number
  updated: number
  unchanged: number
} {
  for (const [destination, content] of plan.writes) {
    mkdirSync(dirname(destination), { recursive: true })
    writeFileSync(destination, content, 'utf8')
  }
  for (const [destination, content] of plan.updates) {
    mkdirSync(dirname(destination), { recursive: true })
    writeFileSync(destination, content, 'utf8')
  }
  return {
    written: plan.writes.size,
    updated: plan.updates.size,
    unchanged: plan.unchanged.length,
  }
}

/**
 * VitePress copies `<srcDir>/public` and nothing else, so the registry output is
 * staged there. Without this the deployed site has no `/r/*.json` and the registry
 * is unreachable for consumers.
 */
export function stageRegistryOutput(sourceDir: string, appRoot: string): number {
  const destination = join(appRoot, 'src/public/r')
  rmSync(destination, { recursive: true, force: true })
  mkdirSync(destination, { recursive: true })
  let copied = 0
  for (const entry of readdirSync(sourceDir)) {
    if (!entry.endsWith('.json')) continue
    writeFileSync(join(destination, entry), readFileSync(join(sourceDir, entry)))
    copied += 1
  }
  // VitePress copies src/public verbatim, so platform header rules have to live
  // beside the registry output rather than in the app-level public directory.
  const headers = join(appRoot, 'public/_headers')
  try {
    writeFileSync(join(appRoot, 'src/public/_headers'), readFileSync(headers))
  } catch {
    // No header rules in this checkout; the site still builds.
  }
  return copied
}

function parseArgs(argv: string[]): {
  sourceDir: string
  appRoot: string
  check: boolean
  overwrite: boolean
} {
  const sourceDir = join(repoRoot, 'apps/docs/public/r')
  const appRoot = join(repoRoot, 'apps/docs')
  let from = sourceDir
  let check = false
  let overwrite = false
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--from') {
      const value = argv[index + 1]
      if (!value) throw new InstallError('--from requires a directory')
      from = resolve(value)
      index += 1
      continue
    }
    if (arg === '--check') {
      check = true
      continue
    }
    if (arg === '--overwrite') {
      overwrite = true
      continue
    }
    if (arg === '--help' || arg === '-h') {
      process.stdout.write(
        [
          'Usage: node scripts/install-ui.ts [--from <dir>] [--check] [--overwrite]',
          '',
          '  --from <dir>  registry output to install (default: apps/docs/public/r)',
          '  --check       report what would change without writing',
          '  --overwrite   replace files whose content differs from the registry output',
          '',
        ].join('\n'),
      )
      process.exit(0)
    }
    throw new InstallError(`unknown argument "${arg}"`)
  }
  return { sourceDir: from, appRoot, check, overwrite }
}

function main(): void {
  const { sourceDir, appRoot, check, overwrite } = parseArgs(process.argv.slice(2))
  const plan = planInstall(sourceDir, appRoot, { overwrite })

  for (const conflict of plan.conflicts) {
    const detail =
      conflict.reason === 'differs'
        ? 'differs from the registry output'
        : conflict.reason === 'outside-app'
          ? 'resolves outside the app directory'
          : 'has no resolvable alias'
    process.stderr.write(`conflict: ${conflict.path} ${detail}\n`)
  }

  if (check) {
    process.stdout.write(
      [
        'p0seid0n ui install (check)',
        `  source   ${sourceDir}`,
        `  would write    ${plan.writes.size}`,
        `  up to date     ${plan.unchanged.length}`,
        `  conflicts      ${plan.conflicts.length}`,
        '',
      ].join('\n'),
    )
    if (plan.conflicts.length > 0 || plan.writes.size > 0) process.exit(1)
    return
  }

  if (plan.conflicts.length > 0) {
    process.stderr.write(
      'error: refusing to write while conflicts remain (pass --overwrite to sync)\n',
    )
    process.exit(1)
  }

  const { written, updated, unchanged } = applyPlan(plan)
  const staged = stageRegistryOutput(sourceDir, appRoot)
  process.stdout.write(
    [
      'p0seid0n ui install',
      `  source   ${sourceDir}`,
      `  written  ${written}`,
      ...(updated > 0 ? [`  updated  ${updated}`] : []),
      `  skipped  ${unchanged}`,
      `  staged   ${staged} registry files into src/public/r`,
      '',
    ].join('\n'),
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main()
  } catch (error) {
    if (error instanceof InstallError) {
      process.stderr.write(`error: ${error.message}\n`)
      process.exit(1)
    }
    throw error
  }
}
