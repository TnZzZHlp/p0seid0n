import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { add } from '../packages/cli/src/add.ts'
import { DEFAULT_CONFIG, readPathMapping } from '../packages/cli/src/config.ts'
import { CliError } from '../packages/cli/src/errors.ts'
import { stripJsonComments } from '../packages/cli/src/fs.ts'
import { init } from '../packages/cli/src/init.ts'
import { detectPackageManager, missingPackages } from '../packages/cli/src/pm.ts'
import { contextFor, itemUrl, parseRef } from '../packages/cli/src/resolve.ts'
import { rewriteImports } from '../packages/cli/src/transform.ts'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const registryOutputDir = join(repoRoot, 'apps/docs/public/r')

function withTempDir(fn: (dir: string) => Promise<void> | void): Promise<void> {
  const dir = mkdtempSync(join(tmpdir(), 'p0seid0n-test-'))
  return Promise.resolve()
    .then(() => fn(dir))
    .finally(() => rmSync(dir, { recursive: true, force: true }))
}

describe('CLI utilities and end-to-end installation', () => {
  it('strips JSONC comments and trailing commas without altering string literals', () => {
    const raw = `{
      // single-line comment with https://example.com
      "url": "https://example.com/*not-a-comment*/",
      /* multi-line
         comment */
      "paths": {
        "@/*": ["./src/*",],
      },
    }`
    const parsed = JSON.parse(stripJsonComments(raw)) as {
      url: string
      paths: Record<string, string[]>
    }
    assert.equal(parsed.url, 'https://example.com/*not-a-comment*/')
    assert.deepEqual(parsed.paths['@/*'], ['./src/*'])
  })

  it('resolves tsconfig paths across extends and Vite solution-style references', async () => {
    await withTempDir((dir) => {
      writeFileSync(
        join(dir, 'tsconfig.json'),
        `{
          // Solution-style config used by create-vue
          "files": [],
          "references": [
            { "path": "./tsconfig.node.json" },
            { "path": "./tsconfig.app.json" },
          ]
        }`,
      )
      writeFileSync(join(dir, 'tsconfig.node.json'), `{"compilerOptions": {"composite": true}}`)
      writeFileSync(
        join(dir, 'tsconfig.base.json'),
        `{"compilerOptions": {"baseUrl": ".", "paths": {"~/*": ["./app/*"]}}}`,
      )
      writeFileSync(
        join(dir, 'tsconfig.app.json'),
        `{
          "extends": "./tsconfig.base.json",
          /* Bundler mode */
          "compilerOptions": {}
        }`,
      )

      const mappings = readPathMapping(dir)
      assert.equal(mappings.length, 1)
      assert.equal(mappings[0].prefix, '~/')
      assert.equal(mappings[0].directory, join(dir, 'app'))
    })
  })

  it('normalises HTTP registry bases with or without a trailing /r segment', () => {
    const nameRef = parseRef('button', '/tmp')
    const bare = contextFor(nameRef, 'https://ui.example.com/')
    const withR = contextFor(nameRef, 'https://ui.example.com/r/')
    assert.equal(itemUrl(bare, 'button'), 'https://ui.example.com/r/button.json')
    assert.equal(itemUrl(withR, 'button'), 'https://ui.example.com/r/button.json')
  })

  it('rewrites @/ imports to custom aliases while keeping default aliases untouched', () => {
    const source = `import { cn } from '@/lib/utils'\nimport { Button } from '@/components/ui/button'\n`
    assert.equal(rewriteImports(source, 'ui/card/Card.vue', DEFAULT_CONFIG), source)

    const rewritten = rewriteImports(source, 'ui/card/Card.vue', {
      ...DEFAULT_CONFIG,
      aliases: {
        components: '~/views',
        ui: '~/views/ui',
        lib: '~/helpers',
        utils: '~/helpers/cn',
      },
    })
    assert.equal(
      rewritten,
      `import { cn } from '~/helpers/cn'\nimport { Button } from '~/views/ui/button'\n`,
    )
  })

  it('detects monorepo lockfiles in parent directories and skips declared packages', async () => {
    await withTempDir((root) => {
      writeFileSync(join(root, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n')
      const subApp = join(root, 'apps/web')
      mkdirSync(subApp, { recursive: true })
      writeFileSync(
        join(subApp, 'package.json'),
        JSON.stringify({
          dependencies: { clsx: '^2.1.1' },
          devDependencies: { 'tailwind-merge': '^3.7.0' },
        }),
      )

      assert.equal(detectPackageManager(subApp), 'pnpm')
      assert.deepEqual(missingPackages(subApp, ['clsx', 'tailwind-merge', 'reka-ui']), ['reka-ui'])
    })
  })

  it('installs components with custom aliases, deduplicates diamond items and protects edits', async () => {
    await withTempDir(async (dir) => {
      init({ cwd: dir, force: false })
      assert.throws(
        () => init({ cwd: dir, force: false }),
        (err: unknown) => err instanceof CliError && /already exists/.test(err.message),
      )

      // Customise aliases to verify placement and import rewriting together.
      writeFileSync(
        join(dir, 'components.json'),
        JSON.stringify(
          {
            style: 'p0seid0n',
            tailwind: { css: 'app/styles/p0seid0n.css', baseColor: 'neutral', cssVariables: true },
            aliases: {
              components: '~/components',
              ui: '~/ui',
              lib: '~/helpers',
              utils: '~/helpers/cn',
            },
          },
          null,
          2,
        ),
      )
      writeFileSync(
        join(dir, 'tsconfig.json'),
        JSON.stringify({ compilerOptions: { paths: { '~/*': ['./app/*'] } } }),
      )

      // Request both theme-switcher and its transitive dependency button via file + name.
      const first = await add({
        cwd: dir,
        items: ['theme-switcher', join(registryOutputDir, 'button.json')],
        overwrite: false,
        install: false,
        registry: registryOutputDir,
      })

      assert.equal(first.conflicts.length, 0)
      assert.equal(first.unchanged.length, 0)
      assert.ok(first.created.includes('app/helpers/cn.ts'))
      assert.ok(first.created.includes('app/styles/p0seid0n.css'))
      assert.ok(first.created.includes('app/ui/button/Button.vue'))
      assert.ok(first.created.includes('app/ui/theme-switcher/ThemeSwitcher.vue'))

      const buttonContent = readFileSync(join(dir, 'app/ui/button/Button.vue'), 'utf8')
      assert.match(buttonContent, /from '~\/helpers\/cn'/)

      // Simulate a user edit and verify conflict protection vs --overwrite.
      writeFileSync(
        join(dir, 'app/ui/button/Button.vue'),
        `${buttonContent}\n<!-- local edit -->\n`,
      )

      const second = await add({
        cwd: dir,
        items: ['button'],
        overwrite: false,
        install: false,
        registry: registryOutputDir,
      })
      assert.deepEqual(second.conflicts, ['app/ui/button/Button.vue'])

      const third = await add({
        cwd: dir,
        items: ['button'],
        overwrite: true,
        install: false,
        registry: registryOutputDir,
      })
      assert.equal(third.conflicts.length, 0)
      assert.deepEqual(third.updated, ['app/ui/button/Button.vue'])
    })
  })
})
