#!/usr/bin/env node
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { add, DEFAULT_REGISTRY, type AddOptions } from './add.ts'
import { CliError } from './errors.ts'
import { readJson } from './fs.ts'
import { init } from './init.ts'

const USAGE = `p0seid0n - install p0seid0n UI components

Usage:
  p0seid0n init [--force] [--cwd <dir>]
  p0seid0n add <item...> [--overwrite] [--no-install] [--cwd <dir>] [--registry <url>]

Commands:
  init    write components.json for this project; refuses to replace an existing one
  add     copy registry items and their dependencies into this project

Items:
  button                                  a name from the configured registry
  https://example.com/r/button.json       a registry item URL
  ./button.json                           a local registry item file

Options:
  --cwd <dir>        project directory (default: the current directory)
  --registry <url>   registry base used for names (default: ${DEFAULT_REGISTRY})
  --overwrite        replace files whose content differs
  --no-install       write files but skip installing package dependencies
  --force            replace an existing components.json (init)
`

type Target = 'init' | 'add' | 'help' | 'version'

function readCliVersion(): string {
  const pkgPath = fileURLToPath(new URL('../package.json', import.meta.url))
  const pkg = readJson<{ version?: string }>(pkgPath)
  return pkg?.version ?? '0.1.0'
}

function parseArgv(argv: string[]): {
  target: Target
  cwd: string
  items: string[]
  overwrite: boolean
  install: boolean
  registry: string
  force: boolean
} {
  const state = {
    target: 'help' as Target,
    cwd: process.cwd(),
    items: [] as string[],
    overwrite: false,
    install: true,
    registry: DEFAULT_REGISTRY,
    force: false,
  }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--help' || arg === '-h') {
      state.target = 'help'
      return state
    }
    if (arg === '--version' || arg === '-v') {
      state.target = 'version'
      return state
    }
    if (arg === '--cwd') {
      const value = argv[++index]
      if (!value) throw new CliError('--cwd requires a directory')
      state.cwd = resolve(value)
      continue
    }
    if (arg === '--registry') {
      const value = argv[++index]
      if (!value) throw new CliError('--registry requires a URL or directory')
      state.registry = value
      continue
    }
    if (arg === '--overwrite') {
      state.overwrite = true
      continue
    }
    if (arg === '--no-install') {
      state.install = false
      continue
    }
    if (arg === '--force') {
      state.force = true
      continue
    }
    if (arg === '--yes' || arg === '-y') {
      // Accepted for compatibility with `shadcn-vue init --yes`; init is non-interactive.
      continue
    }
    if (arg.startsWith('-')) throw new CliError(`unknown option "${arg}"`)
    if (arg === 'init' || arg === 'add') {
      state.target = arg
      continue
    }
    if (state.target === 'help') {
      throw new CliError(`unknown command "${arg}"; expected init or add`)
    }
    state.items.push(arg)
  }
  return state
}

async function runAdd(options: AddOptions): Promise<number> {
  const result = await add(options)
  const lines = [
    `p0seid0n add`,
    `  created    ${result.created.length}`,
    ...result.created.map((path) => `             ${path}`),
    `  updated    ${result.updated.length}`,
    ...result.updated.map((path) => `             ${path}`),
    `  unchanged  ${result.unchanged.length}`,
    ...result.unchanged.map((path) => `             ${path}`),
  ]
  if (result.conflicts.length > 0) {
    lines.push(
      `  conflicts  ${result.conflicts.length}`,
      ...result.conflicts.map((path) => `             ${path}`),
      '',
      'These files exist with different content and were left alone.',
      'Re-run with --overwrite to replace them.',
    )
  }
  const allPackages = [...result.dependencies, ...result.devDependencies]
  if (allPackages.length > 0) {
    lines.push(`  packages   ${allPackages.join(' ')}`)
    if (result.installed) lines.push(`  installed  yes`)
    else if (result.installCommand) lines.push(`  install    ${result.installCommand}`)
  }
  process.stdout.write(`${lines.join('\n')}\n`)
  return result.conflicts.length > 0 ? 1 : 0
}

async function main(argv: string[]): Promise<number> {
  const parsed = parseArgv(argv)
  if (parsed.target === 'help') {
    process.stdout.write(USAGE)
    return 0
  }
  if (parsed.target === 'version') {
    process.stdout.write(`${readCliVersion()}\n`)
    return 0
  }
  if (parsed.target === 'init') {
    const result = init({ cwd: parsed.cwd, force: parsed.force })
    process.stdout.write(`wrote ${result.path}\n`)
    return 0
  }
  return runAdd({
    cwd: parsed.cwd,
    items: parsed.items,
    overwrite: parsed.overwrite,
    install: parsed.install,
    registry: parsed.registry,
  })
}

try {
  process.exitCode = await main(process.argv.slice(2))
} catch (error) {
  if (error instanceof CliError) {
    process.stderr.write(`error: ${error.message}\n`)
    process.exitCode = 1
  } else {
    throw error
  }
}
