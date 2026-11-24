import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { areaPaths, niceMax, normalizeAreaData } from '../registry/ui/area-chart/geometry.ts'
import { matchesCommandItem } from '../registry/ui/command/context.ts'
import { reverseSliderValues, sliderStepMax } from '../registry/ui/slider/inverted-values.ts'
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

it('reflects inverted slider ranges without moving values off the step grid', () => {
  const values = [0.1, 0.7]
  const max = sliderStepMax(0.1, 0.95, 0.2)
  const inverted = reverseSliderValues(values, 0.1, max)
  assert.deepEqual(inverted, [0.3, 0.9])
  assert.deepEqual(reverseSliderValues(inverted, 0.1, max), values)
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

describe('area-chart geometry', () => {
  it('handles empty, single-point and all-zero inputs deterministically', () => {
    const empty = areaPaths([])
    assert.equal(empty.linePath, '')
    assert.equal(empty.areaPath, '')
    assert.equal(empty.points.length, 0)

    const single = areaPaths([42])
    assert.equal(single.linePath, 'M0,4L100,4')
    assert.equal(single.areaPath, 'M0,4L100,4L100,100L0,100Z')
    assert.deepEqual(single.points, [{ x: 50, y: 4, value: 42 }])

    const zeros = areaPaths([0, 0, 0], { curve: 'linear' })
    assert.equal(zeros.linePath, 'M0,100L50,100L100,100')
    assert.equal(zeros.areaPath, 'M0,100L50,100L100,100L100,100L0,100Z')
  })

  it('builds monotone cubic curves without overshoot and linear segments when requested', () => {
    const mono = areaPaths([0, 100, 0, 80], { curve: 'monotone' })
    assert.equal(mono.linePath.includes('NaN'), false)
    assert.match(mono.linePath, /^M0,100C/)
    assert.match(mono.areaPath, /L100,100L0,100Z$/)

    // Every cubic control point y must stay within the [4, 100] plot range.
    const matches = [...mono.linePath.matchAll(/C([^L]+)/g)]
    assert.equal(matches.length, 1)
    const coords = mono.linePath.slice(1).split(/[MC,]/).map(Number)
    for (let i = 1; i < coords.length; i += 2) {
      assert.ok(coords[i] >= 4 && coords[i] <= 100, `unexpected y coordinate ${coords[i]}`)
    }

    const lin = areaPaths([10, 50, 25], { curve: 'linear', max: 100 })
    assert.equal(lin.linePath, 'M0,90.4L50,52L100,76')
    assert.equal(niceMax([Number.NaN, -5, 42]), 42)
  })

  it('normalises tabular multi-series data and categories', () => {
    const norm = normalizeAreaData({
      data: [
        { ts: '10:00', down: 120, up: 40 },
        { ts: '10:05', down: 150, up: 55 },
      ],
      categories: ['down', 'up'],
      index: 'ts',
    })
    assert.deepEqual(norm.labels, ['10:00', '10:05'])
    assert.equal(norm.pointCount, 2)
    assert.equal(norm.series.length, 2)
    assert.deepEqual(norm.series[0], { name: 'down', values: [120, 150], tone: 'accent' })
    assert.deepEqual(norm.series[1], { name: 'up', values: [40, 55], tone: 'accent-alt' })
  })
})

describe('command filtering predicate', () => {
  const contains = (text: string, sub: string) => text.toLowerCase().includes(sub.toLowerCase())

  it('matches empty queries, values and keywords without matching unrelated entries', () => {
    assert.equal(matchesCommandItem('Run latency check', ['ping', 'rtt'], '', contains), true)
    assert.equal(matchesCommandItem('Run latency check', ['ping', 'rtt'], '   ', contains), true)
    assert.equal(matchesCommandItem('Run latency check', ['ping', 'rtt'], 'LAT', contains), true)
    assert.equal(matchesCommandItem('Run latency check', ['ping', 'rtt'], 'rtt', contains), true)
    assert.equal(matchesCommandItem('Run latency check', ['ping', 'rtt'], 'dns', contains), false)
    assert.equal(matchesCommandItem('Export CSV', undefined, 'json', contains), false)
  })
})

describe('component SFC regression contracts', () => {
  it('binds v-model:open and v-model:page without forcing defaults', () => {
    for (const rel of [
      'registry/ui/dialog/Dialog.vue',
      'registry/ui/dropdown-menu/DropdownMenu.vue',
      'registry/ui/tooltip/Tooltip.vue',
      'registry/ui/popover/Popover.vue',
      'registry/ui/alert-dialog/AlertDialog.vue',
      'registry/ui/sheet/Sheet.vue',
      'registry/ui/select/Select.vue',
      'registry/ui/command/CommandDialog.vue',
    ]) {
      const content = readFileSync(join(repoRoot, rel), 'utf8')
      assert.match(content, /defineModel<boolean>\('open'\)/)
      assert.match(content, /v-model:open="open"/)
    }

    const pagination = readFileSync(join(repoRoot, 'registry/ui/pagination/Pagination.vue'), 'utf8')
    assert.match(pagination, /defineModel<number>\('page'\)/)
    assert.match(pagination, /v-model:page="page"/)
  })

  it('forwards aria-label to SliderThumb in Slider', () => {
    const slider = readFileSync(join(repoRoot, 'registry/ui/slider/Slider.vue'), 'utf8')
    assert.match(slider, /function thumbAriaLabel/)
    assert.match(slider, /:aria-label="thumbAriaLabel\(index\)"/)
  })

  it('handles merged array onClick listeners in Button and border-line in Card', () => {
    const button = readFileSync(join(repoRoot, 'registry/ui/button/Button.vue'), 'utf8')
    assert.match(button, /Array\.isArray\(raw\)/)

    const card = readFileSync(join(repoRoot, 'registry/ui/card/Card.vue'), 'utf8')
    assert.match(card, /rounded-panel border border-line/)

    const input = readFileSync(join(repoRoot, 'registry/ui/input/Input.vue'), 'utf8')
    assert.equal(input.includes('@input="onInput"'), false)
  })

  it('wires paired enter/exit motion tokens and reduced-motion guards across components', () => {
    const css = readFileSync(join(repoRoot, 'registry/styles/p0seid0n.css'), 'utf8')
    for (const token of [
      '--p0seid0n-ease-out',
      '--p0seid0n-ease-in',
      '--p0seid0n-ease-spring',
      '--p0seid0n-duration-fast',
      '--p0seid0n-duration-normal',
      '--p0seid0n-duration-slow',
      '@keyframes p0seid0n-dialog-in',
      '@keyframes p0seid0n-dialog-out',
      '@keyframes p0seid0n-pop-in',
      '@keyframes p0seid0n-pop-out',
      '@keyframes p0seid0n-toast-in',
      '@keyframes p0seid0n-toast-out',
      '@keyframes p0seid0n-accordion-down',
      '@keyframes p0seid0n-accordion-up',
      '@keyframes p0seid0n-sheet-in',
      '@keyframes p0seid0n-sheet-out',
      '@keyframes p0seid0n-progress-indeterminate',
    ]) {
      assert.ok(css.includes(token), `expected p0seid0n.css to declare ${token}`)
    }

    const tabsList = readFileSync(join(repoRoot, 'registry/ui/tabs/TabsList.vue'), 'utf8')
    assert.match(tabsList, /<TabsIndicator/)

    const toast = readFileSync(join(repoRoot, 'registry/ui/toast/Toast.vue'), 'utf8')
    assert.match(toast, /motion-safe:animate-toast-in/)
    assert.match(toast, /data-ending-style:motion-safe:animate-toast-out/)

    const dialogContent = readFileSync(
      join(repoRoot, 'registry/ui/dialog/DialogContent.vue'),
      'utf8',
    )
    assert.match(dialogContent, /motion-safe:animate-dialog-in/)
    assert.match(dialogContent, /data-\[state=closed\]:motion-safe:animate-dialog-out/)

    const accordionContent = readFileSync(
      join(repoRoot, 'registry/ui/accordion/AccordionContent.vue'),
      'utf8',
    )
    assert.match(accordionContent, /motion-safe:transition-\[height,opacity\]/)
    assert.match(accordionContent, /motion-safe:data-ending-style:h-0/)

    const sheetContent = readFileSync(join(repoRoot, 'registry/ui/sheet/SheetContent.vue'), 'utf8')
    assert.match(sheetContent, /sheetVariants/)
    const sheetVariants = readFileSync(join(repoRoot, 'registry/ui/sheet/variants.ts'), 'utf8')
    assert.match(sheetVariants, /motion-safe:animate-sheet-in/)
    assert.match(sheetVariants, /data-\[state=closed\]:motion-safe:animate-sheet-out/)

    const progress = readFileSync(join(repoRoot, 'registry/ui/progress/Progress.vue'), 'utf8')
    assert.match(progress, /motion-safe:animate-progress-indeterminate/)
  })

  it('defends Breadcrumb against prose list/link leakage and preserves Accordion type inference', () => {
    const breadcrumbList = readFileSync(
      join(repoRoot, 'registry/ui/breadcrumb/BreadcrumbList.vue'),
      'utf8',
    )
    assert.match(breadcrumbList, /\bm-0\b/)
    assert.match(breadcrumbList, /\blist-none\b/)
    assert.match(breadcrumbList, /\bp-0\b/)

    const breadcrumbItem = readFileSync(
      join(repoRoot, 'registry/ui/breadcrumb/BreadcrumbItem.vue'),
      'utf8',
    )
    assert.match(breadcrumbItem, /\bm-0\b/)
    assert.match(breadcrumbItem, /\binline-flex\b/)
    assert.match(breadcrumbItem, /\blist-none\b/)

    const breadcrumbSeparator = readFileSync(
      join(repoRoot, 'registry/ui/breadcrumb/BreadcrumbSeparator.vue'),
      'utf8',
    )
    assert.match(breadcrumbSeparator, /\bm-0\b/)
    assert.match(breadcrumbSeparator, /\binline-flex\b/)
    assert.match(breadcrumbSeparator, /\blist-none\b/)
    assert.match(breadcrumbSeparator, /\[&>svg\]:size-3\.5/)

    const breadcrumbLink = readFileSync(
      join(repoRoot, 'registry/ui/breadcrumb/BreadcrumbLink.vue'),
      'utf8',
    )
    assert.match(breadcrumbLink, /\bno-underline\b/)

    const accordion = readFileSync(join(repoRoot, 'registry/ui/accordion/Accordion.vue'), 'utf8')
    assert.match(accordion, /type:\s*undefined/)
    assert.match(accordion, /Array\.isArray\(model\.value \?\? props\.defaultValue\)/)

    const accordionTrigger = readFileSync(
      join(repoRoot, 'registry/ui/accordion/AccordionTrigger.vue'),
      'utf8',
    )
    assert.match(accordionTrigger, /<AccordionHeader class="m-0 flex">/)
    assert.match(accordionTrigger, /group-hover:text-ink/)

    const accordionContent = readFileSync(
      join(repoRoot, 'registry/ui/accordion/AccordionContent.vue'),
      'utf8',
    )
    assert.match(accordionContent, /\[&>p\]:m-0/)
  })
})
