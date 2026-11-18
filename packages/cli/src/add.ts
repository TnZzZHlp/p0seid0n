import { spawnSync } from 'node:child_process'

import { readConfig, readPathMapping } from './config.ts'
import { CliError } from './errors.ts'
import { displayPath, writeFileChecked } from './fs.ts'
import { destinationFor, type Destination } from './place.ts'
import {
  assertSafePackages,
  detectPackageManager,
  formatCommand,
  installCommand,
  missingPackages,
} from './pm.ts'
import { parseRef, resolvePlan, type ItemRef } from './resolve.ts'
import { rewriteImports } from './transform.ts'

export const DEFAULT_REGISTRY = 'https://p0seid0n.tnzzzhlp.workers.dev'

export type AddOptions = {
  cwd: string
  items: string[]
  overwrite: boolean
  install: boolean
  registry: string
}

export type AddResult = {
  created: string[]
  updated: string[]
  unchanged: string[]
  conflicts: string[]
  dependencies: string[]
  devDependencies: string[]
  installed: boolean
  installCommand: string | null
}

function runInstall(cwd: string, command: string, args: string[]): void {
  const formatted = formatCommand(command, args)
  const run = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    // On Windows npm/pnpm/yarn are .cmd shims; package names are pre-validated.
    shell: process.platform === 'win32',
  })
  if (run.error) {
    throw new CliError(
      `could not run "${formatted}": ${run.error.message}; files were written, install dependencies manually`,
    )
  }
  if (run.status !== 0) {
    throw new CliError(
      `"${formatted}" exited with ${run.status}; files were written, install dependencies manually`,
    )
  }
}

/**
 * Installs the requested items plus everything they depend on. Files are written
 * only after the whole graph resolves, so a cycle or a missing dependency leaves
 * the project untouched.
 */
export async function add(options: AddOptions): Promise<AddResult> {
  if (options.items.length === 0) {
    throw new CliError('add needs at least one item, for example `p0seid0n add button`')
  }
  const config = readConfig(options.cwd)
  const mappings = readPathMapping(options.cwd)
  if (mappings.length === 0) {
    throw new CliError(
      `no path aliases found in tsconfig.json; add compilerOptions.paths such as "@/*": ["./src/*"]`,
    )
  }

  const refs: ItemRef[] = options.items.map((item) => parseRef(item, options.cwd))
  const plan = await resolvePlan(refs, options.registry, options.cwd)

  const result: AddResult = {
    created: [],
    updated: [],
    unchanged: [],
    conflicts: [],
    dependencies: [],
    devDependencies: [],
    installed: false,
    installCommand: null,
  }

  const packages = new Set<string>()
  const devPackages = new Set<string>()
  for (const { item } of plan.items) {
    for (const dependency of item.dependencies ?? []) packages.add(dependency)
    for (const devDependency of item.devDependencies ?? []) devPackages.add(devDependency)
  }

  // Every destination is resolved before anything is written, and deduplicated by
  // absolute path so diamond dependencies never write the same file twice.
  const plannedByPath = new Map<string, { destination: Destination; content: string }>()
  for (const { item } of plan.items) {
    for (const file of item.files) {
      const destination = destinationFor(file, config, mappings, options.cwd)
      if (plannedByPath.has(destination.absolute)) continue
      const content = rewriteImports(file.content ?? '', file.path, config)
      plannedByPath.set(destination.absolute, { destination, content })
    }
  }

  for (const { destination, content } of plannedByPath.values()) {
    const written = writeFileChecked(destination.absolute, content, {
      overwrite: options.overwrite,
    })
    const shown = displayPath(options.cwd, written.path)
    if (written.outcome === 'created') result.created.push(shown)
    else if (written.outcome === 'updated') result.updated.push(shown)
    else if (written.outcome === 'unchanged') result.unchanged.push(shown)
    else result.conflicts.push(shown)
  }

  result.dependencies = [...packages].sort()
  result.devDependencies = [...devPackages].filter((pkg) => !packages.has(pkg)).sort()
  assertSafePackages(result.dependencies)
  assertSafePackages(result.devDependencies)

  if (result.conflicts.length > 0) return result
  if (result.dependencies.length === 0 && result.devDependencies.length === 0) return result

  const manager = detectPackageManager(options.cwd)
  const missingDeps = missingPackages(options.cwd, result.dependencies)
  const missingDevDeps = missingPackages(options.cwd, result.devDependencies)

  const commands: { command: string; args: string[] }[] = []
  if (!options.install) {
    if (result.dependencies.length > 0) {
      commands.push(installCommand(manager, result.dependencies))
    }
    if (result.devDependencies.length > 0) {
      commands.push(installCommand(manager, result.devDependencies, { dev: true }))
    }
    result.installCommand = commands
      .map((entry) => formatCommand(entry.command, entry.args))
      .join(' && ')
    return result
  }

  if (missingDeps.length > 0) {
    commands.push(installCommand(manager, missingDeps))
  }
  if (missingDevDeps.length > 0) {
    commands.push(installCommand(manager, missingDevDeps, { dev: true }))
  }
  if (commands.length === 0) {
    result.installed = true
    return result
  }

  result.installCommand = commands
    .map((entry) => formatCommand(entry.command, entry.args))
    .join(' && ')
  for (const entry of commands) {
    runInstall(options.cwd, entry.command, entry.args)
  }
  result.installed = true
  return result
}
