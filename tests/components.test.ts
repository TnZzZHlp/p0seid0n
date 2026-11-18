import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { median, scaleTop, sparklinePath } from '../registry/ui/sparkline/geometry.ts'
import { readStoredTheme, themeScript } from '../registry/ui/theme-provider/theme.ts'
import { createToastStack } from '../registry/ui/toast/stack.ts'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

describe('sparkline geometry', () => {
  it('handles empty, single-point and all-zero inputs deterministically', () => {
    assert.equal(sparklinePath({ values: [] }), '')
    assert.equal(sparklinePath({ values: [42] }), 'M0.2,1V0h0.6V1Z')
    assert.equal(
      sparklinePath({ values: [0, 0, 0] }),
      'M0.2,1V1h0.6V1ZM1.2,1V1h0.6V1ZM2.2,1V1h0.6V1Z',
    )
  })

  it('clamps extreme spikes to median * 3 while preserving normal series', () => {
    assert.equal(median([10, 10, 10, 10, 1000]), 10)
    assert.equal(scaleTop([10, 10, 10, 10, 1000]), 30)
  })

  it('scales fractional < 1 series and sparse zero-heavy series without crushing or clipping', () => {
    assert.equal(scaleTop([0.1, 0.2, 0.3]), 0.3)
    const path = sparklinePath({ values: [0.15, 0.3] })
    assert.equal(path, 'M0.2,1V0.5h0.6V1ZM1.2,1V0h0.6V1Z')

    // Majority zeros should not collapse median * 3 to 0 and clip every non-zero bar.
    assert.equal(scaleTop([0, 0, 0, 50, 100]), 100)
  })

  it('sanitises NaN/negative inputs and handles 100k samples without stack overflow', () => {
    const dirty = sparklinePath({ values: [Number.NaN, -10, 20] })
    assert.equal(dirty.includes('NaN'), false)
    assert.equal(dirty, 'M0.2,1V1h0.6V1ZM1.2,1V1h0.6V1ZM2.2,1V0h0.6V1Z')

    const large = new Array<number>(100_000).fill(5)
    assert.equal(scaleTop(large), 5)
  })
})

describe('toast stack state', () => {
  it('caps notifications at max, drops oldest, and bumps version when re-pushing an id', () => {
    const stack = createToastStack()
    stack.push({ id: 'a', title: 'First' }, 4000, 3)
    stack.push({ id: 'b', title: 'Second' }, 4000, 3)
    stack.push({ id: 'c', title: 'Third' }, 4000, 3)
    stack.push({ id: 'd', title: 'Fourth' }, 4000, 3)

    assert.deepEqual(
      stack.items.value.map((item) => item.id),
      ['b', 'c', 'd'],
    )

    const beforeVersion = stack.items.value.find((item) => item.id === 'b')!.version
    stack.push({ id: 'b', title: 'Second updated' }, 4000, 3)
    assert.deepEqual(
      stack.items.value.map((item) => item.id),
      ['c', 'd', 'b'],
    )
    const afterRecord = stack.items.value.find((item) => item.id === 'b')!
    assert.ok(afterRecord.version > beforeVersion)
    assert.equal(afterRecord.title, 'Second updated')

    stack.dismiss('d')
    assert.deepEqual(
      stack.items.value.map((item) => item.id),
      ['c', 'b'],
    )
    stack.dismissAll()
    assert.equal(stack.items.value.length, 0)
  })
})

describe('theme-provider storage and inline script', () => {
  it('falls back to defaultTheme when storage is empty and executes themeScript cleanly', () => {
    const store = new Map<string, string>()
    const classes = new Set<string>(['light'])
    const attrs = new Map<string, string>()

    const prevStorage = globalThis.localStorage
    const prevDoc = globalThis.document

    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, val: string) => store.set(key, val),
        removeItem: (key: string) => store.delete(key),
      },
    })
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: {
        documentElement: {
          classList: {
            add: (...tokens: string[]) => tokens.forEach((t) => classes.add(t)),
            remove: (...tokens: string[]) => tokens.forEach((t) => classes.delete(t)),
          },
          setAttribute: (name: string, val: string) => attrs.set(name, val),
          removeAttribute: (name: string) => attrs.delete(name),
        },
      },
    })

    try {
      assert.equal(readStoredTheme('p0seid0n-theme', 'dark'), 'dark')

      // Empty storage + defaultTheme="dark" paints dark immediately.
      new Function(themeScript('p0seid0n-theme', 'data-theme', 'dark'))()
      assert.equal(classes.has('dark'), true)
      assert.equal(classes.has('light'), false)
      assert.equal(attrs.get('data-theme'), 'dark')

      // Explicit stored "system" clears pinned classes and attribute even with defaultTheme="dark".
      store.set('p0seid0n-theme', 'system')
      assert.equal(readStoredTheme('p0seid0n-theme', 'dark'), 'system')
      new Function(themeScript('p0seid0n-theme', 'data-theme', 'dark'))()
      assert.equal(classes.size, 0)
      assert.equal(attrs.has('data-theme'), false)
    } finally {
      Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: prevStorage })
      Object.defineProperty(globalThis, 'document', { configurable: true, value: prevDoc })
    }
  })
})

describe('component SFC regression contracts', () => {
  it('binds v-model:open on Dialog, DropdownMenu and Tooltip without forcing false', () => {
    for (const rel of [
      'registry/ui/dialog/Dialog.vue',
      'registry/ui/dropdown-menu/DropdownMenu.vue',
      'registry/ui/tooltip/Tooltip.vue',
    ]) {
      const content = readFileSync(join(repoRoot, rel), 'utf8')
      assert.match(content, /defineModel<boolean>\('open'\)/)
      assert.match(content, /v-model:open="open"/)
    }
  })

  it('handles merged array onClick listeners in Button and border-line in Card', () => {
    const button = readFileSync(join(repoRoot, 'registry/ui/button/Button.vue'), 'utf8')
    assert.match(button, /Array\.isArray\(raw\)/)

    const card = readFileSync(join(repoRoot, 'registry/ui/card/Card.vue'), 'utf8')
    assert.match(card, /rounded-panel border border-line/)

    const input = readFileSync(join(repoRoot, 'registry/ui/input/Input.vue'), 'utf8')
    assert.equal(input.includes('@input="onInput"'), false)
  })
})
