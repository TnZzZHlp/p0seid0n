import { existsSync } from 'node:fs'
import { join } from 'node:path'

export type PackageManager = 'pnpm' | 'yarn' | 'bun' | 'npm'

const LOCKFILES: { file: string; manager: PackageManager }[] = [
  { file: 'pnpm-lock.yaml', manager: 'pnpm' },
  { file: 'package-lock.json', manager: 'npm' },
  { file: 'yarn.lock', manager: 'yarn' },
  { file: 'bun.lockb', manager: 'bun' },
  { file: 'bun.lock', manager: 'bun' },
]

export function detectPackageManager(cwd: string): PackageManager {
  for (const { file, manager } of LOCKFILES) {
    if (existsSync(join(cwd, file))) return manager
  }
  return 'npm'
}

export function installCommand(
  manager: PackageManager,
  packages: string[],
): {
  command: string
  args: string[]
} {
  const joined = [...packages]
  if (manager === 'pnpm') return { command: 'pnpm', args: ['add', ...joined] }
  if (manager === 'yarn') return { command: 'yarn', args: ['add', ...joined] }
  if (manager === 'bun') return { command: 'bun', args: ['add', ...joined] }
  return { command: 'npm', args: ['install', ...joined] }
}

export function formatCommand(command: string, args: string[]): string {
  return [command, ...args].join(' ')
}
