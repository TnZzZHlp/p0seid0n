import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'

import { CliError } from './errors.ts'

export function readText(path: string): string | null {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return null
  }
}

export function readJson<T>(path: string): T | null {
  const text = readText(path)
  if (text === null) return null
  try {
    return JSON.parse(text) as T
  } catch {
    throw new CliError(`${path} is not valid JSON`)
  }
}

/**
 * Strips `//` line comments, `/* ... *\/` block comments and trailing commas
 * outside string literals so standard tsconfig/jsconfig files parse cleanly.
 */
export function stripJsonComments(input: string): string {
  let out = ''
  let index = 0
  let inString = false

  while (index < input.length) {
    const ch = input[index]
    const next = input[index + 1]

    if (inString) {
      out += ch
      if (ch === '\\' && index + 1 < input.length) {
        out += next
        index += 2
        continue
      }
      if (ch === '"') inString = false
      index += 1
      continue
    }

    if (ch === '"') {
      inString = true
      out += ch
      index += 1
      continue
    }

    if (ch === '/' && next === '/') {
      index += 2
      while (index < input.length && input[index] !== '\n') index += 1
      continue
    }

    if (ch === '/' && next === '*') {
      index += 2
      while (index < input.length && !(input[index] === '*' && input[index + 1] === '/')) {
        if (input[index] === '\n') out += '\n'
        index += 1
      }
      index += 2
      continue
    }

    out += ch
    index += 1
  }

  return stripTrailingCommas(out)
}

function stripTrailingCommas(input: string): string {
  let out = ''
  let index = 0
  let inString = false

  while (index < input.length) {
    const ch = input[index]
    if (inString) {
      out += ch
      if (ch === '\\' && index + 1 < input.length) {
        out += input[index + 1]
        index += 2
        continue
      }
      if (ch === '"') inString = false
      index += 1
      continue
    }
    if (ch === '"') {
      inString = true
      out += ch
      index += 1
      continue
    }
    if (ch === ',') {
      let lookahead = index + 1
      while (lookahead < input.length && /\s/.test(input[lookahead])) lookahead += 1
      if (input[lookahead] === '}' || input[lookahead] === ']') {
        index += 1
        continue
      }
    }
    out += ch
    index += 1
  }
  return out
}

export function readJsonc<T>(path: string): T | null {
  const text = readText(path)
  if (text === null) return null
  try {
    return JSON.parse(stripJsonComments(text)) as T
  } catch {
    throw new CliError(`${path} is not valid JSON`)
  }
}

export function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content, 'utf8')
}

/**
 * Rejects destinations that escape the project. A registry item is untrusted
 * input once it comes from a URL, so every path it names is checked here.
 */
export function assertInside(root: string, path: string): void {
  if (!isInside(root, path)) {
    throw new CliError(`${path} resolves outside ${root}`)
  }
}

export function isInside(root: string, path: string): boolean {
  const relativePath = relative(resolve(root), resolve(path))
  if (relativePath === '') return true
  if (isAbsolute(relativePath)) return false
  return !relativePath.split(sep).includes('..')
}

/** Relative form used in output so messages stay short and copyable. */
export function displayPath(root: string, path: string): string {
  const relativePath = relative(resolve(root), resolve(path))
  return relativePath === '' ? '.' : relativePath.split(sep).join('/')
}

export type WriteOutcome = 'created' | 'updated' | 'unchanged' | 'conflict'

export type WriteResult = {
  path: string
  outcome: WriteOutcome
}

/**
 * Writes one file, refusing to silently replace content the user may have
 * edited. A file that is absent or identical is safe; anything else needs
 * `overwrite`, matching the shadcn CLI's behaviour.
 */
export function writeFileChecked(
  path: string,
  content: string,
  options: { overwrite: boolean },
): WriteResult {
  const existing = readText(path)
  if (existing === content) return { path, outcome: 'unchanged' }
  if (existing !== null) {
    if (!options.overwrite) return { path, outcome: 'conflict' }
    writeText(path, content)
    return { path, outcome: 'updated' }
  }
  writeText(path, content)
  return { path, outcome: 'created' }
}

/** True when a file exists and already holds `content`. */
export function matchesContent(path: string, content: string): boolean {
  return existsSync(path) && readText(path) === content
}
