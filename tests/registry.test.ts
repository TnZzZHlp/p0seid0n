import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  buildItemPayload,
  buildRegistrySummary,
  REGISTRY_ITEM_SCHEMA,
  REGISTRY_SCHEMA,
  serialize,
} from '../scripts/build-registry/manifest.ts'
import { BuildError, validateManifest } from '../scripts/build-registry/validate.ts'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const registryRoot = join(repoRoot, 'registry')

function walkFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...walkFiles(full))
    } else {
      results.push(full)
    }
  }
  return results
}

describe('registry manifest and build pipeline', () => {
  it('validates the repository manifest and emits upstream $schema fields', () => {
    const raw = JSON.parse(readFileSync(join(registryRoot, 'registry.json'), 'utf8')) as unknown
    const manifest = validateManifest(raw, registryRoot)
    assert.ok(manifest.items.length >= 38)

    const expectedNewItems = [
      'textarea',
      'checkbox',
      'radio-group',
      'select',
      'slider',
      'popover',
      'alert-dialog',
      'sheet',
      'accordion',
      'breadcrumb',
      'pagination',
      'alert',
      'progress',
      'skeleton',
      'avatar',
      'table',
      'toggle',
      'command',
      'area-chart',
    ]
    for (const name of expectedNewItems) {
      const entry = manifest.items.find((item) => item.name === name)
      assert.ok(entry, `expected manifest to include "${name}"`)
      const first = serialize(buildItemPayload(entry, registryRoot))
      const second = serialize(buildItemPayload(entry, registryRoot))
      assert.equal(first, second, `expected deterministic serialization for "${name}"`)
    }

    const summary = buildRegistrySummary(manifest)
    assert.equal(summary.$schema, REGISTRY_SCHEMA)
    assert.equal(summary.items.length, manifest.items.length)
    for (const entry of summary.items) {
      assert.ok(entry.files.length > 0, `summary item ${entry.name} must list its files`)
    }

    const button = manifest.items.find((item) => item.name === 'button')
    assert.ok(button)
    const firstPass = serialize(buildItemPayload(button, registryRoot))
    const secondPass = serialize(buildItemPayload(button, registryRoot))
    assert.equal(firstPass, secondPass)
    assert.equal((JSON.parse(firstPass) as { $schema: string }).$schema, REGISTRY_ITEM_SCHEMA)
  })

  it('rejects duplicate names, missing targets, path traversal and dependency cycles', () => {
    assert.throws(
      () =>
        validateManifest(
          {
            name: 'test',
            homepage: 'https://example.com',
            items: [
              {
                name: 'dup',
                type: 'registry:lib',
                files: [{ path: 'lib/utils.ts', type: 'registry:lib' }],
              },
              {
                name: 'dup',
                type: 'registry:lib',
                files: [{ path: 'lib/utils.ts', type: 'registry:lib' }],
              },
            ],
          },
          registryRoot,
        ),
      (err: unknown) => err instanceof BuildError && /duplicated/.test(err.message),
    )

    assert.throws(
      () =>
        validateManifest(
          {
            name: 'test',
            homepage: 'https://example.com',
            items: [
              {
                name: 'bad-file',
                type: 'registry:theme',
                files: [{ path: 'styles/p0seid0n.css', type: 'registry:file' }],
              },
            ],
          },
          registryRoot,
        ),
      (err: unknown) => err instanceof BuildError && /target is required/.test(err.message),
    )

    assert.throws(
      () =>
        validateManifest(
          {
            name: 'test',
            homepage: 'https://example.com',
            items: [
              {
                name: 'escape',
                type: 'registry:lib',
                files: [{ path: '../package.json', type: 'registry:lib' }],
              },
            ],
          },
          registryRoot,
        ),
      (err: unknown) => err instanceof BuildError && /without "\.\."/.test(err.message),
    )

    assert.throws(
      () =>
        validateManifest(
          {
            name: 'test',
            homepage: 'https://example.com',
            items: [
              {
                name: 'alpha',
                type: 'registry:lib',
                registryDependencies: ['beta'],
                files: [{ path: 'lib/utils.ts', type: 'registry:lib' }],
              },
              {
                name: 'beta',
                type: 'registry:lib',
                registryDependencies: ['alpha'],
                files: [{ path: 'lib/utils.ts', type: 'registry:lib' }],
              },
            ],
          },
          registryRoot,
        ),
      (err: unknown) =>
        err instanceof BuildError && /cycle: alpha -> beta -> alpha/.test(err.message),
    )
  })

  it('keeps hex colour literals restricted to p0seid0n.css and bans dark: variants', () => {
    const hexPattern = /(?<!&)#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\b/
    const darkPattern = /(?:^|[\s'"`])dark:[a-zA-Z0-9_-]+/

    for (const file of walkFiles(registryRoot)) {
      const content = readFileSync(file, 'utf8')
      if (!file.endsWith('styles/p0seid0n.css')) {
        assert.equal(hexPattern.test(content), false, `unexpected hex colour literal in ${file}`)
      }
      if (file.includes('/ui/')) {
        assert.equal(darkPattern.test(content), false, `unexpected dark: variant in ${file}`)
      }
    }
  })
})
