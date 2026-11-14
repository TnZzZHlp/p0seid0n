import { spawnSync } from 'node:child_process'

import { readConfig, readPathMapping } from './config.ts'
import { CliError } from './errors.ts'
import { displayPath, writeFileChecked } from './fs.ts'
import { destinationFor } from './place.ts'
import { detectPackageManager, formatCommand, installCommand } from './pm.ts'
import { parseRef, resolvePlan, type ItemRef } from './resolve.ts'

export const DEFAULT_REGISTRY = 'https://p0seid0n.example.com'

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
  installed: boolean
  installCommand: string | null
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
    installed: false,
    installCommand: null,
  }

  const packages = new Set<string>()
  for (const { item } of plan.items) {
    for (const dependency of item.dependencies ?? []) packages.add(dependency)
  }

  // Every destination is resolved before anything is written. A path that
  // escapes its directory then fails the run without leaving half a component
  // behind.
  const planned = plan.items.flatMap(({ item }) =>
    item.files.map((file) => ({
      destination: destinationFor(file, config, mappings, options.cwd),
      content: file.content ?? '',
    })),
  )

  for (const { destination, content } of planned) {
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
  if (result.conflicts.length > 0) return result
  if (result.dependencies.length === 0) return result

  const manager = detectPackageManager(options.cwd)
  const { command, args } = installCommand(manager, result.dependencies)
  result.installCommand = formatCommand(command, args)
  // `--no-install` still reports the command so a CI run can collect it and run
  // it later; it only skips spawning the package manager.
  if (!options.install) return result
  const run = spawnSync(command, args, { cwd: options.cwd, stdio: 'inherit', shell: false })
  if (run.error) {
    throw new CliError(
      `could not run "${result.installCommand}": ${run.error.message}; files were written, install dependencies manually`,
    )
  }
  if (run.status !== 0) {
    throw new CliError(
      `"${result.installCommand}" exited with ${run.status}; files were written, install dependencies manually`,
    )
  }
  result.installed = true
  return result
}
