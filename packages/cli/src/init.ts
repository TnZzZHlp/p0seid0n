import { existsSync } from 'node:fs'

import { CONFIG_FILE, DEFAULT_CONFIG, configPath } from './config.ts'
import { CliError } from './errors.ts'
import { writeText } from './fs.ts'

export type InitOptions = {
  cwd: string
  force: boolean
}

export function init(options: InitOptions): { path: string; created: boolean } {
  const path = configPath(options.cwd)
  if (existsSync(path) && !options.force) {
    throw new CliError(`${CONFIG_FILE} already exists at ${path}; pass --force to replace it`)
  }
  writeText(path, `${JSON.stringify(DEFAULT_CONFIG, null, 2)}\n`)
  return { path, created: true }
}
