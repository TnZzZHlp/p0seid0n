import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildAllPayload,
  buildItemPayload,
  buildRegistryIndex,
  buildRegistrySummary,
  serialize,
} from './manifest.ts'
import { BuildError, validateManifest } from './validate.ts'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const registryRoot = join(repoRoot, 'registry')
const defaultOutDir = join(repoRoot, 'apps/docs/public/r')

function parseArgs(argv: string[]): { outDir: string } {
  let outDir = defaultOutDir
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--out' || arg === '--out-dir') {
      const value = argv[index + 1]
      if (!value) throw new BuildError(`${arg} requires a directory argument`)
      outDir = resolve(value)
      index += 1
      continue
    }
    if (arg === '--help' || arg === '-h') {
      process.stdout.write(
        [
          'Usage: node scripts/build-registry/index.ts [--out <dir>]',
          '',
          `  --out <dir>  output directory (default: apps/docs/public/r)`,
          '',
        ].join('\n'),
      )
      process.exit(0)
    }
    throw new BuildError(`unknown argument "${arg}"`)
  }
  return { outDir }
}

function readManifest(): unknown {
  const manifestPath = join(registryRoot, 'registry.json')
  let raw: string
  try {
    raw = readFileSync(manifestPath, 'utf8')
  } catch {
    throw new BuildError('manifest: registry/registry.json could not be read')
  }
  try {
    return JSON.parse(raw)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new BuildError(`manifest: registry/registry.json is not valid JSON (${message})`)
  }
}

function main(): void {
  const { outDir } = parseArgs(process.argv.slice(2))

  const manifest = validateManifest(readManifest(), registryRoot)

  const itemPayloads = manifest.items.map((item) => buildItemPayload(item, registryRoot))
  const summary = buildRegistrySummary(manifest)
  const index = buildRegistryIndex(manifest)
  const all = buildAllPayload(manifest, registryRoot)

  // Rebuild from scratch so removed items do not linger in the output.
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  const written: string[] = []
  const emit = (fileName: string, value: unknown): void => {
    writeFileSync(join(outDir, fileName), serialize(value), 'utf8')
    written.push(fileName)
  }

  for (const payload of itemPayloads) emit(`${payload.name}.json`, payload)
  emit('registry.json', summary)
  emit('index.json', index)
  emit('all.json', all)

  process.stdout.write(
    [
      `p0seid0n registry build`,
      `  manifest  registry/registry.json (${manifest.items.length} items)`,
      `  output    ${outDir}`,
      ...written.map((file) => `    ${file}`),
      '',
    ].join('\n'),
  )
}

try {
  main()
} catch (error) {
  if (error instanceof BuildError) {
    process.stderr.write(`error: ${error.message}\n`)
    process.exit(1)
  }
  throw error
}
