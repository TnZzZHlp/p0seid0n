import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { CliError } from './errors.ts'
import { readJson } from './fs.ts'

export type PackageManager = 'pnpm' | 'yarn' | 'bun' | 'npm'

const LOCKFILES: { file: string; manager: PackageManager }[] = [
  { file: 'pnpm-lock.yaml', manager: 'pnpm' },
  { file: 'package-lock.json', manager: 'npm' },
  { file: 'yarn.lock', manager: 'yarn' },
  { file: 'bun.lockb', manager: 'bun' },
  { file: 'bun.lock', manager: 'bun' },
]

type PackageJsonShape = {
  packageManager?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

function managerFromField(field: string | undefined): PackageManager | null {
  if (!field) return null
  const name = field.split('@')[0]
  if (name === 'pnpm' || name === 'yarn' || name === 'bun' || name === 'npm') return name
  return null
}

/**
 * Walks up from `cwd` to locate a lockfile or `packageManager` declaration so
 * workspace packages inside a monorepo still pick the repository's manager.
 */
export function detectPackageManager(cwd: string): PackageManager {
  let current = resolve(cwd)
  while (true) {
    for (const { file, manager } of LOCKFILES) {
      if (existsSync(join(current, file))) return manager
    }
    const pkg = readJson<PackageJsonShape>(join(current, 'package.json'))
    const declared = managerFromField(pkg?.packageManager)
    if (declared) return declared

    const parent = dirname(current)
    if (parent === current) break
    current = parent
  }
  return 'npm'
}

const SAFE_SPEC =
  /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*(@[a-zA-Z0-9-._~^><=|*+]+)?$/

export function assertSafePackages(packages: string[]): void {
  for (const spec of packages) {
    if (!SAFE_SPEC.test(spec)) {
      throw new CliError(`refusing to install unsafe package specifier "${spec}"`)
    }
  }
}

export function packageNameFromSpec(spec: string): string {
  if (spec.startsWith('@')) {
    const secondAt = spec.indexOf('@', 1)
    return secondAt === -1 ? spec : spec.slice(0, secondAt)
  }
  const firstAt = spec.indexOf('@')
  return firstAt === -1 ? spec : spec.slice(0, firstAt)
}

/**
 * Filters out packages already declared in the target project's `package.json`
 * so adding a second component does not re-run the package manager redundantly.
 */
export function missingPackages(cwd: string, packages: string[]): string[] {
  const pkg = readJson<PackageJsonShape>(join(cwd, 'package.json'))
  if (!pkg) return [...packages]
  const existing = new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ])
  return packages.filter((spec) => !existing.has(packageNameFromSpec(spec)))
}

export function installCommand(
  manager: PackageManager,
  packages: string[],
  options: { dev?: boolean } = {},
): {
  command: string
  args: string[]
} {
  const devFlag = options.dev ? ['-D'] : []
  const joined = [...packages]
  if (manager === 'pnpm') return { command: 'pnpm', args: ['add', ...devFlag, ...joined] }
  if (manager === 'yarn') return { command: 'yarn', args: ['add', ...devFlag, ...joined] }
  if (manager === 'bun') return { command: 'bun', args: ['add', ...devFlag, ...joined] }
  return { command: 'npm', args: ['install', ...(options.dev ? ['--save-dev'] : []), ...joined] }
}

export function formatCommand(command: string, args: string[]): string {
  return [command, ...args].join(' ')
}
