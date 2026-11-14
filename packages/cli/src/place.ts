import { basename, join, posix, relative, sep } from 'node:path'

import type { ComponentsConfig, PathMapping } from './config.ts'
import { CliError } from './errors.ts'
import { assertInside } from './fs.ts'
import type { RegistryFile } from './resolve.ts'

/**
 * Turns an alias such as `@/components/ui` into an absolute directory using the
 * project's own tsconfig paths. The alias is never rewritten by guesswork: if no
 * mapping matches, the caller is told which alias failed.
 */
export function resolveAlias(alias: string, mappings: PathMapping[]): string {
  for (const mapping of mappings) {
    if (alias.startsWith(mapping.prefix)) {
      const rest = alias.slice(mapping.prefix.length)
      return rest ? join(mapping.directory, rest) : mapping.directory
    }
  }
  throw new CliError(
    `alias "${alias}" has no match in tsconfig.json paths; add a mapping such as "${alias.split('/')[0]}/*"`,
  )
}

/**
 * Upstream shadcn-vue strips the longest alias tail found in the registry path
 * and joins the remainder onto the resolved alias directory, so
 * `ui/button/Button.vue` becomes `<aliases.ui>/button/Button.vue` and
 * `components/ui/button/Button.vue` becomes the same thing.
 */
function nestedPath(filePath: string, config: ComponentsConfig): string {
  const normalized = filePath.replace(/^\/+|\/+$/g, '')
  const tails = Object.values(config.aliases)
    .map((alias) => alias.replace(/^@[^/]*\//, '').replace(/^\/+|\/+$/g, ''))
    .filter((tail) => tail.length > 0)
    .sort((a, b) => b.length - a.length)
  for (const tail of tails) {
    const index = normalized.indexOf(`${tail}/`)
    if (index === -1) continue
    return normalized.slice(index + tail.length + 1)
  }
  // No alias tail present: drop the leading segment (`ui/`, `lib/`) so the file
  // lands directly inside the alias directory.
  const segments = normalized.split('/')
  return segments.length > 1 ? segments.slice(1).join('/') : normalisedBasename(normalized)
}

function normalisedBasename(value: string): string {
  return value.split('/').pop() ?? value
}

function directoryForType(type: string, config: ComponentsConfig, mappings: PathMapping[]): string {
  if (type === 'registry:ui') return resolveAlias(config.aliases.ui, mappings)
  if (type === 'registry:lib') return resolveAlias(config.aliases.lib, mappings)
  return resolveAlias(config.aliases.components, mappings)
}

export type Destination = {
  absolute: string
  /** Path shown to the user, relative to the project root. */
  relative: string
}

/**
 * Mirrors upstream `resolveFilePath`: an explicit `target` wins, a leading `~/`
 * means the project root, and a bare target is relative to `src/` when the
 * components alias already lives under it.
 */
export function destinationFor(
  file: RegistryFile,
  config: ComponentsConfig,
  mappings: PathMapping[],
  cwd: string,
): Destination {
  let absolute: string
  if (file.target) {
    if (file.target.startsWith('~/')) {
      absolute = join(cwd, file.target.slice(2))
    } else {
      // A target such as `styles/p0seid0n.css` is relative to the alias root, so
      // it lands beside the components the tokens are meant for. Upstream joins
      // it onto the project root instead, which breaks as soon as the source
      // folder is not literally named `src`.
      absolute = join(aliasRoot(mappings), file.target.replace(/^src\//, ''))
    }
  } else {
    const directory = directoryForType(file.type, config, mappings)
    const rest = nestedPath(file.path, config)
    absolute = rest ? join(directory, rest) : join(directory, basename(file.path))
    // A registry path is untrusted input. `ui/../../../x.vue` normalises to a
    // path that is still inside the project, so checking only the project root
    // would let a component write anywhere within it. Upstream validates against
    // the target directory, which is what keeps a ui item inside `aliases.ui`.
    assertInside(directory, absolute)
  }
  assertInside(cwd, absolute)
  return { absolute, relative: toPosix(relative(cwd, absolute)) }
}

/**
 * The directory the alias prefix maps to, taken from the shortest mapping so
 * `@/*` wins over a more specific `@/components/*`.
 */
export function aliasRoot(mappings: PathMapping[]): string {
  if (mappings.length === 0) return ''
  return mappings.reduce((shortest, mapping) =>
    mapping.prefix.length < shortest.prefix.length ? mapping : shortest,
  ).directory
}

function toPosix(value: string): string {
  return value.split(sep).join(posix.sep)
}
