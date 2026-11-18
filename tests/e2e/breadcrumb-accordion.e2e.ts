import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'

import { BrowserSession } from './browser.ts'

type ThemeChoice = 'system' | 'light' | 'dark'

type ResolvedTokens = {
  ink: string
  inkMuted: string
  raised: string
  line: string
}

async function resolveThemeTokens(session: BrowserSession): Promise<ResolvedTokens> {
  return session.evaluate(() => {
    const readVar = (cssVar: string, prop: 'color' | 'backgroundColor'): string => {
      const probe = document.createElement('span')
      probe.style.position = 'fixed'
      probe.style.visibility = 'hidden'
      probe.style[prop] = `var(${cssVar})`
      document.body.appendChild(probe)
      const value = getComputedStyle(probe)[prop]
      probe.remove()
      return value
    }
    return {
      ink: readVar('--p0seid0n-ink', 'color'),
      inkMuted: readVar('--p0seid0n-ink-muted', 'color'),
      raised: readVar('--p0seid0n-raised', 'backgroundColor'),
      line: readVar('--p0seid0n-line', 'color'),
    }
  })
}

async function switchTheme(session: BrowserSession, choice: ThemeChoice): Promise<void> {
  await session.click('button[aria-label="Appearance"]')
  const optionSelector = `[data-testid="theme-${choice}"]`
  await session.waitFor((sel: string) => Boolean(document.querySelector(sel)), [optionSelector], {
    message: `Theme menu option ${choice} did not open`,
  })
  await session.click(optionSelector)
  await session.waitFor(
    (targetChoice: ThemeChoice) => {
      const cls = document.documentElement.classList
      if (targetChoice === 'system') return !cls.contains('light') && !cls.contains('dark')
      return cls.contains(targetChoice)
    },
    [choice],
    { message: `Theme did not switch to ${choice}` },
  )
  await session.nextFrame()
}

describe('Breadcrumb & Accordion E2E', () => {
  let session: BrowserSession

  before(async () => {
    session = await BrowserSession.launch()
  })

  after(async () => {
    await session.close()
  })

  describe('Breadcrumb (/components/breadcrumb)', () => {
    it('renders isolated layout, ARIA structure, token colours, hover and keyboard focus', async () => {
      await session.goto('/components/breadcrumb')
      assert.deepEqual(session.errors, [])

      const structure = await session.evaluate(() => {
        const surfaces = [...document.querySelectorAll('.example-surface')]
        const summaries = [...document.querySelectorAll('details > summary')]
        const nav = document.querySelector('.example-surface nav[aria-label="Breadcrumb"]')
        const ol = nav?.querySelector('ol')
        const items = ol ? [...ol.children] : []

        const csOl = ol ? getComputedStyle(ol) : null
        const liMetrics = items.map((li) => {
          const rect = li.getBoundingClientRect()
          const cs = getComputedStyle(li)
          return {
            role: li.getAttribute('role'),
            ariaHidden: li.getAttribute('aria-hidden'),
            text: li.textContent?.trim() ?? '',
            display: cs.display,
            listStyleType: cs.listStyleType,
            marginTop: cs.marginTop,
            left: rect.left,
            right: rect.right,
            centerY: rect.top + rect.height / 2,
            width: rect.width,
            height: rect.height,
          }
        })

        const links = [...(ol?.querySelectorAll('a') ?? [])].map((a) => {
          const cs = getComputedStyle(a)
          return {
            text: a.textContent?.trim() ?? '',
            color: cs.color,
            textDecorationLine: cs.textDecorationLine,
          }
        })

        const ellipsis = ol?.querySelector('span[role="presentation"][aria-hidden="true"]')
        const ellipsisSrOnly = ellipsis?.querySelector('.sr-only')?.textContent?.trim() ?? null
        const page = ol?.querySelector(
          'span[role="link"][aria-disabled="true"][aria-current="page"]',
        )
        const csPage = page ? getComputedStyle(page) : null

        return {
          allSurfacesRaw: surfaces.every((el) => el.classList.contains('vp-raw')),
          summaryMargins: summaries.map((el) => getComputedStyle(el).marginTop),
          hasNav: Boolean(nav),
          olStyles: csOl
            ? {
                listStyleType: csOl.listStyleType,
                paddingLeft: csOl.paddingLeft,
                marginTop: csOl.marginTop,
                marginBottom: csOl.marginBottom,
              }
            : null,
          liMetrics,
          links,
          ellipsisSrOnly,
          pageText: page?.textContent?.trim() ?? null,
          pageColor: csPage?.color ?? null,
          pageFontWeight: csPage?.fontWeight ?? null,
        }
      })

      assert.equal(structure.allSurfacesRaw, true)
      assert.ok(structure.summaryMargins.length >= 2)
      for (const mt of structure.summaryMargins) {
        assert.equal(mt, '0px')
      }

      assert.equal(structure.hasNav, true)
      assert.deepEqual(structure.olStyles, {
        listStyleType: 'none',
        paddingLeft: '0px',
        marginTop: '0px',
        marginBottom: '0px',
      })

      assert.equal(structure.liMetrics.length, 7)
      assert.equal(structure.ellipsisSrOnly, 'More')
      assert.equal(structure.pageText, 'Frankfurt (fra-01)')
      assert.equal(structure.pageFontWeight, '500')

      const baseCenterY = structure.liMetrics[0].centerY
      for (let i = 0; i < structure.liMetrics.length; i += 1) {
        const entry = structure.liMetrics[i]
        assert.equal(entry.marginTop, '0px')
        assert.notEqual(entry.display, 'list-item')
        assert.equal(entry.listStyleType, 'none')
        assert.ok(
          Math.abs(entry.centerY - baseCenterY) <= 1.5,
          `item ${i} (${entry.text}) drifted vertically: ${entry.centerY} vs ${baseCenterY}`,
        )
        if (i > 0) {
          const prev = structure.liMetrics[i - 1]
          assert.ok(
            prev.right <= entry.left + 0.5,
            `item ${i} (${entry.text}) overlapped previous item (${prev.text}): ${prev.right} > ${entry.left}`,
          )
        }
      }

      const separatorIndices = [1, 3, 5]
      for (const idx of separatorIndices) {
        assert.equal(structure.liMetrics[idx].role, 'presentation')
        assert.equal(structure.liMetrics[idx].ariaHidden, 'true')
        assert.equal(structure.liMetrics[idx].text, '/')
      }

      const tokens = await resolveThemeTokens(session)
      assert.equal(structure.pageColor, tokens.ink)
      assert.equal(structure.links.length, 2)
      for (const link of structure.links) {
        assert.equal(link.textDecorationLine, 'none')
        assert.equal(link.color, tokens.inkMuted)
      }

      // Hovering a BreadcrumbLink transitions its colour from ink-muted to ink.
      await session.hover('.example-surface nav[aria-label="Breadcrumb"] a', 0)
      const hoveredColor = await session.waitFor(
        (expected: string) => {
          const link = document.querySelector('.example-surface nav[aria-label="Breadcrumb"] a')
          if (!link) return false
          const color = getComputedStyle(link).color
          return color === expected ? color : false
        },
        [tokens.ink],
        { message: 'BreadcrumbLink colour did not transition to --p0seid0n-ink on hover' },
      )
      assert.equal(hoveredColor, tokens.ink)

      // Tabbing from the first link skips separator + ellipsis and lands on the next link with focus-visible ring.
      await session.evaluate(() => {
        const firstLink = document.querySelector(
          '.example-surface nav[aria-label="Breadcrumb"] a',
        ) as HTMLElement | null
        firstLink?.focus()
      })
      await session.pressKey('Tab')
      const focusedAfterTab = await session.evaluate(() => {
        const active = document.activeElement as HTMLElement | null
        const cs = active ? getComputedStyle(active) : null
        return {
          tagName: active?.tagName.toLowerCase() ?? null,
          text: active?.textContent?.trim() ?? null,
          outlineWidth: cs?.outlineWidth ?? null,
          outlineStyle: cs?.outlineStyle ?? null,
        }
      })
      assert.equal(focusedAfterTab.tagName, 'a')
      assert.equal(focusedAfterTab.text, 'Regions')
      assert.equal(focusedAfterTab.outlineWidth, '2px')
      assert.equal(focusedAfterTab.outlineStyle, 'solid')
      assert.deepEqual(session.errors, [])
    })

    it('supports custom SVG separators, as-child buttons, and Light/Dark theme switching', async () => {
      await session.goto('/components/breadcrumb')
      assert.deepEqual(session.errors, [])

      const customBefore = await session.evaluate(() => {
        const nav = document.querySelector('.example-surface nav[aria-label="Region trail"]')
        const buttons = [...(nav?.querySelectorAll('button') ?? [])]
        const nestedAnchors = [...(nav?.querySelectorAll('li a') ?? [])]
        const separators = [...(nav?.querySelectorAll('li[role="presentation"]') ?? [])]
        const svgRects = separators.map((sep) => {
          const svg = sep.querySelector('svg')
          return svg ? svg.getBoundingClientRect() : null
        })
        const page = nav?.querySelector('[aria-current="page"]')
        return {
          buttonTexts: buttons.map((b) => b.textContent?.trim()),
          nestedAnchorCount: nestedAnchors.length,
          svgSizes: svgRects.map((r) => (r ? { w: r.width, h: r.height } : null)),
          pageText: page?.textContent?.trim() ?? null,
        }
      })

      assert.deepEqual(customBefore.buttonTexts, ['Network', 'Europe'])
      assert.equal(customBefore.nestedAnchorCount, 0)
      assert.equal(customBefore.pageText, 'Frankfurt (fra-01)')
      for (const size of customBefore.svgSizes) {
        assert.ok(size)
        assert.ok(Math.abs(size.w - 14) <= 0.5, `expected custom SVG width ~14px, got ${size.w}`)
        assert.ok(Math.abs(size.h - 14) <= 0.5, `expected custom SVG height ~14px, got ${size.h}`)
      }

      // Click the `as-child` "Europe" button to promote it to BreadcrumbPage.
      await session.click('.example-surface nav[aria-label="Region trail"] button', 1)
      const afterDrillUp = await session.waitFor(() => {
        const nav = document.querySelector('.example-surface nav[aria-label="Region trail"]')
        const page = nav?.querySelector('[aria-current="page"]')?.textContent?.trim()
        if (page !== 'Europe') return false
        const buttons = [...(nav?.querySelectorAll('button') ?? [])].map((b) =>
          b.textContent?.trim(),
        )
        return { page, buttons }
      })
      assert.equal(afterDrillUp.page, 'Europe')
      assert.deepEqual(afterDrillUp.buttons, ['Network'])

      // Click "Reset path" and verify the full trail returns.
      await session.click('.example-surface nav[aria-label="Region trail"] + div button')
      const afterReset = await session.waitFor(() => {
        const nav = document.querySelector('.example-surface nav[aria-label="Region trail"]')
        const page = nav?.querySelector('[aria-current="page"]')?.textContent?.trim()
        return page === 'Frankfurt (fra-01)' ? page : false
      })
      assert.equal(afterReset, 'Frankfurt (fra-01)')

      // Verify theme switching updates Breadcrumb colours via light-dark() tokens.
      await switchTheme(session, 'light')
      const lightTokens = await resolveThemeTokens(session)
      const lightState = await session.waitFor(
        (expectedLink: string, expectedPage: string) => {
          const nav = document.querySelector('.example-surface nav[aria-label="Breadcrumb"]')!
          const link = nav.querySelector('a')!
          const page = nav.querySelector('[aria-current="page"]')!
          const linkColor = getComputedStyle(link).color
          const pageColor = getComputedStyle(page).color
          return linkColor === expectedLink && pageColor === expectedPage
            ? { linkColor, pageColor }
            : false
        },
        [lightTokens.inkMuted, lightTokens.ink],
        { message: 'Breadcrumb did not settle to light theme token colours' },
      )
      assert.equal(lightState.linkColor, lightTokens.inkMuted)
      assert.equal(lightState.pageColor, lightTokens.ink)

      await switchTheme(session, 'dark')
      const darkTokens = await resolveThemeTokens(session)
      const darkState = await session.waitFor(
        (expectedLink: string, expectedPage: string) => {
          const nav = document.querySelector('.example-surface nav[aria-label="Breadcrumb"]')!
          const link = nav.querySelector('a')!
          const page = nav.querySelector('[aria-current="page"]')!
          const linkColor = getComputedStyle(link).color
          const pageColor = getComputedStyle(page).color
          return linkColor === expectedLink && pageColor === expectedPage
            ? { linkColor, pageColor }
            : false
        },
        [darkTokens.inkMuted, darkTokens.ink],
        { message: 'Breadcrumb did not settle to dark theme token colours' },
      )
      assert.equal(darkState.linkColor, darkTokens.inkMuted)
      assert.equal(darkState.pageColor, darkTokens.ink)
      assert.notEqual(lightState.linkColor, darkState.linkColor)
      assert.notEqual(lightState.pageColor, darkState.pageColor)

      await switchTheme(session, 'system')
      assert.deepEqual(session.errors, [])
    })
  })

  describe('Accordion (/components/accordion)', () => {
    it('isolates heading margins, links ARIA controls/regions, and toggles single panels with motion', async () => {
      await session.goto('/components/accordion')
      assert.deepEqual(session.errors, [])

      const initial = await session.evaluate(() => {
        const surfaces = [...document.querySelectorAll('.example-surface')]
        const basicRoot = surfaces[0]?.firstElementChild as HTMLElement | null
        if (!basicRoot) return null

        const items = [...basicRoot.children].filter((el) => el.hasAttribute('data-orientation'))
        const headers = [...basicRoot.querySelectorAll('h3')]
        const triggers = [...basicRoot.querySelectorAll('button[data-reka-collection-item]')]
        const regions = [...basicRoot.querySelectorAll('[role="region"]')]

        const allTriggers = [
          ...document.querySelectorAll('.example-surface button[data-reka-collection-item]'),
        ]
        const ariaPairs = allTriggers.map((btn) => {
          const controlsId = btn.getAttribute('aria-controls') ?? ''
          const region = controlsId ? document.getElementById(controlsId) : null
          return {
            triggerId: btn.id,
            controlsId,
            regionRole: region?.getAttribute('role') ?? null,
            regionLabelledBy: region?.getAttribute('aria-labelledby') ?? null,
          }
        })

        return {
          allSurfacesRaw: surfaces.every((el) => el.classList.contains('vp-raw')),
          headerMargins: headers.map((h) => {
            const cs = getComputedStyle(h)
            return { mt: cs.marginTop, mb: cs.marginBottom }
          }),
          itemBorders: items.map((item) => getComputedStyle(item).borderBottomWidth),
          triggerStyles: triggers.map((btn) => {
            const cs = getComputedStyle(btn)
            const svg = btn.querySelector('svg')
            return {
              text: btn.textContent?.trim() ?? '',
              expanded: btn.getAttribute('aria-expanded'),
              state: btn.getAttribute('data-state'),
              pt: cs.paddingTop,
              pb: cs.paddingBottom,
              fontSize: cs.fontSize,
              fontWeight: cs.fontWeight,
              svgRotate: svg ? getComputedStyle(svg).rotate : null,
              svgTransitionProperty: svg ? getComputedStyle(svg).transitionProperty : null,
            }
          }),
          regionStates: regions.map((r) => ({
            hidden: (r as HTMLElement).hidden,
            state: r.getAttribute('data-state'),
            height: r.getBoundingClientRect().height,
          })),
          ariaPairs,
        }
      })

      assert.ok(initial)
      assert.equal(initial.allSurfacesRaw, true)

      for (const margin of initial.headerMargins) {
        assert.equal(margin.mt, '0px')
        assert.equal(margin.mb, '0px')
      }

      assert.deepEqual(initial.itemBorders, ['1px', '1px', '0px'])

      for (const pair of initial.ariaPairs) {
        assert.ok(pair.triggerId.length > 0, 'trigger must have a non-empty id')
        assert.ok(pair.controlsId.length > 0, 'trigger must have a non-empty aria-controls')
        assert.equal(pair.regionRole, 'region')
        assert.equal(pair.regionLabelledBy, pair.triggerId)
      }

      assert.equal(initial.triggerStyles.length, 3)
      for (const trig of initial.triggerStyles) {
        assert.equal(trig.pt, '16px')
        assert.equal(trig.pb, '16px')
        assert.equal(trig.fontSize, '15px')
        assert.equal(trig.fontWeight, '500')
      }

      // First item starts open with rotated chevron; others start closed.
      assert.equal(initial.triggerStyles[0].expanded, 'true')
      assert.equal(initial.triggerStyles[0].state, 'open')
      assert.equal(initial.triggerStyles[0].svgRotate, '180deg')
      assert.match(initial.triggerStyles[0].svgTransitionProperty ?? '', /rotate/)
      assert.match(initial.triggerStyles[0].svgTransitionProperty ?? '', /color/)
      assert.equal(initial.regionStates[0].hidden, false)
      assert.ok(initial.regionStates[0].height > 20)

      assert.equal(initial.triggerStyles[1].expanded, 'false')
      assert.equal(initial.triggerStyles[1].svgRotate, 'none')
      assert.equal(initial.regionStates[1].hidden, true)
      assert.equal(initial.regionStates[1].height, 0)

      assert.equal(initial.triggerStyles[2].expanded, 'false')
      assert.equal(initial.regionStates[2].hidden, true)
      assert.equal(initial.regionStates[2].height, 0)

      // Click second trigger in basic accordion -> item 2 opens, item 1 collapses completely.
      await session.click('.example-surface button[data-reka-collection-item]', 1)
      const afterSecondOpen = await session.waitFor(() => {
        const root = document.querySelectorAll('.example-surface')[0]?.firstElementChild
        if (!root) return false
        const triggers = [...root.querySelectorAll('button[data-reka-collection-item]')]
        const regions = [...root.querySelectorAll('[role="region"]')] as HTMLElement[]
        const firstClosed =
          triggers[0]?.getAttribute('aria-expanded') === 'false' &&
          regions[0]?.hidden === true &&
          regions[0].getBoundingClientRect().height === 0
        const secondOpen =
          triggers[1]?.getAttribute('aria-expanded') === 'true' &&
          regions[1]?.hidden === false &&
          regions[1].getBoundingClientRect().height > 20
        if (!firstClosed || !secondOpen) return false
        return {
          secondText: regions[1].textContent?.trim() ?? '',
          secondHeightVar: regions[1].style.getPropertyValue('--reka-collapsible-content-height'),
        }
      })
      assert.match(afterSecondOpen.secondText, /src\/components\/ui/)
      assert.notEqual(afterSecondOpen.secondHeightVar, '0px')

      // Click second trigger again (collapsible: true) -> all panels collapse.
      await session.click('.example-surface button[data-reka-collection-item]', 1)
      const allCollapsed = await session.waitFor(() => {
        const root = document.querySelectorAll('.example-surface')[0]?.firstElementChild
        if (!root) return false
        const triggers = [...root.querySelectorAll('button[data-reka-collection-item]')]
        const regions = [...root.querySelectorAll('[role="region"]')] as HTMLElement[]
        const closed = triggers.every((t, idx) => {
          return (
            t.getAttribute('aria-expanded') === 'false' &&
            regions[idx]?.hidden === true &&
            regions[idx].getBoundingClientRect().height === 0
          )
        })
        return closed ? true : false
      })
      assert.equal(allCollapsed, true)

      // Hovering an AccordionTrigger transitions its default chevron icon from ink-muted to ink.
      const accordionTokens = await resolveThemeTokens(session)
      await session.hover('.example-surface button[data-reka-collection-item]', 1)
      const hoveredChevronColor = await session.waitFor(
        (expected: string) => {
          const btn = document.querySelectorAll(
            '.example-surface button[data-reka-collection-item]',
          )[1]
          const svg = btn?.querySelector('svg')
          if (!svg) return false
          const color = getComputedStyle(svg).color
          return color === expected ? color : false
        },
        [accordionTokens.ink],
        { message: 'AccordionTrigger chevron did not transition to --p0seid0n-ink on hover' },
      )
      assert.equal(hoveredChevronColor, accordionTokens.ink)

      // Reduced motion disables accordion content keyframe animation & trigger icon transition.
      await session.setReducedMotion(true)
      try {
        await session.click('.example-surface button[data-reka-collection-item]', 0)
        const reduced = await session.waitFor(() => {
          const root = document.querySelectorAll('.example-surface')[0]?.firstElementChild
          const trigger = root?.querySelector('button[data-reka-collection-item]')
          const region = root?.querySelector('[role="region"]') as HTMLElement | null
          if (trigger?.getAttribute('aria-expanded') !== 'true' || !region || region.hidden) {
            return false
          }
          const svg = trigger.querySelector('svg')
          return {
            regionAnimation: getComputedStyle(region).animationName,
            svgTransitionProperty: svg ? getComputedStyle(svg).transitionProperty : null,
          }
        })
        assert.equal(reduced.regionAnimation, 'none')
        assert.equal(reduced.svgTransitionProperty, 'none')
      } finally {
        await session.setReducedMotion(false)
      }

      assert.deepEqual(session.errors, [])
    })

    it('supports keyboard navigation, multiple open items, disabled items, custom icons, and Dark theme', async () => {
      await session.goto('/components/accordion')
      assert.deepEqual(session.errors, [])

      // Keyboard navigation on basic accordion triggers (ArrowDown, End, ArrowUp, Home, Enter, Space).
      await session.evaluate(() => {
        const firstBtn = document.querySelector(
          '.example-surface button[data-reka-collection-item]',
        ) as HTMLElement | null
        firstBtn?.focus()
      })

      const focusedIndex = () =>
        session.evaluate(() => {
          const root = document.querySelectorAll('.example-surface')[0]?.firstElementChild
          const triggers = [...(root?.querySelectorAll('button[data-reka-collection-item]') ?? [])]
          return triggers.indexOf(document.activeElement as Element)
        })

      await session.pressKey('ArrowDown')
      assert.equal(await focusedIndex(), 1)
      await session.pressKey('End')
      assert.equal(await focusedIndex(), 2)
      await session.pressKey('ArrowUp')
      assert.equal(await focusedIndex(), 1)
      await session.pressKey('Home')
      assert.equal(await focusedIndex(), 0)

      // Enter collapses open item 0; Space opens item 0 back up.
      await session.pressKey('Enter')
      await session.waitFor(() => {
        const btn = document.querySelector('.example-surface button[data-reka-collection-item]')
        return btn?.getAttribute('aria-expanded') === 'false'
      })
      await session.pressKey('Space')
      await session.waitFor(() => {
        const btn = document.querySelector('.example-surface button[data-reka-collection-item]')
        return btn?.getAttribute('aria-expanded') === 'true'
      })

      // Multiple-mode accordion (second example) infers type="multiple" from array defaultValue.
      const multiInitial = await session.evaluate(() => {
        const multiRoot = document.querySelectorAll('.example-surface')[1]?.firstElementChild
        if (!multiRoot) return null
        const triggers = [
          ...multiRoot.querySelectorAll('button[data-reka-collection-item]'),
        ] as HTMLButtonElement[]
        const regions = [...multiRoot.querySelectorAll('[role="region"]')] as HTMLElement[]
        const firstParagraph = regions[0]?.querySelector('p')
        const firstCustomIcon = triggers[0]?.querySelector('span')
        return {
          firstExpanded: triggers[0]?.getAttribute('aria-expanded'),
          firstHasCustomIcon: firstCustomIcon?.textContent?.trim() === '+',
          firstHasDefaultSvg: Boolean(triggers[0]?.querySelector('svg')),
          firstParagraphMargin: firstParagraph
            ? {
                mt: getComputedStyle(firstParagraph).marginTop,
                mb: getComputedStyle(firstParagraph).marginBottom,
              }
            : null,
          secondExpanded: triggers[1]?.getAttribute('aria-expanded'),
          thirdDisabled: triggers[2]?.disabled,
          thirdDataDisabled: triggers[2]?.getAttribute('data-disabled'),
          thirdExpanded: triggers[2]?.getAttribute('aria-expanded'),
        }
      })

      assert.ok(multiInitial)
      assert.equal(multiInitial.firstExpanded, 'true')
      assert.equal(multiInitial.firstHasCustomIcon, true)
      assert.equal(multiInitial.firstHasDefaultSvg, false)
      assert.deepEqual(multiInitial.firstParagraphMargin, { mt: '0px', mb: '0px' })
      assert.equal(multiInitial.secondExpanded, 'false')
      assert.equal(multiInitial.thirdDisabled, true)
      assert.equal(multiInitial.thirdDataDisabled, '')
      assert.equal(multiInitial.thirdExpanded, 'false')

      // Click second item in multiple accordion -> BOTH item 0 and item 1 stay open!
      await session.evaluate(() => {
        const multiRoot = document.querySelectorAll('.example-surface')[1]?.firstElementChild
        const triggers = [
          ...(multiRoot?.querySelectorAll('button[data-reka-collection-item]') ?? []),
        ]
        ;(triggers[1] as HTMLElement | undefined)?.scrollIntoView({ block: 'center' })
      })
      await session.click('.example-surface button[data-reka-collection-item]', 4)
      const bothOpen = await session.waitFor(() => {
        const multiRoot = document.querySelectorAll('.example-surface')[1]?.firstElementChild
        if (!multiRoot) return false
        const triggers = [...multiRoot.querySelectorAll('button[data-reka-collection-item]')]
        const regions = [...multiRoot.querySelectorAll('[role="region"]')] as HTMLElement[]
        const ok =
          triggers[0]?.getAttribute('aria-expanded') === 'true' &&
          triggers[1]?.getAttribute('aria-expanded') === 'true' &&
          !regions[0]?.hidden &&
          !regions[1]?.hidden &&
          regions[0].getBoundingClientRect().height > 20 &&
          regions[1].getBoundingClientRect().height > 20
        return ok ? true : false
      })
      assert.equal(bothOpen, true)

      // Disabled item cannot be opened via click and is skipped by arrow navigation.
      await session.click('.example-surface button[data-reka-collection-item]', 5)
      const disabledState = await session.evaluate(() => {
        const multiRoot = document.querySelectorAll('.example-surface')[1]?.firstElementChild
        const triggers = [
          ...(multiRoot?.querySelectorAll('button[data-reka-collection-item]') ?? []),
        ]
        const regions = [...(multiRoot?.querySelectorAll('[role="region"]') ?? [])] as HTMLElement[]
        return {
          expanded: triggers[2]?.getAttribute('aria-expanded'),
          hidden: regions[2]?.hidden,
        }
      })
      assert.equal(disabledState.expanded, 'false')
      assert.equal(disabledState.hidden, true)

      // ArrowDown from trigger 1 in multiple accordion skips disabled trigger 2.
      await session.evaluate(() => {
        const multiRoot = document.querySelectorAll('.example-surface')[1]?.firstElementChild
        const triggers = [
          ...(multiRoot?.querySelectorAll('button[data-reka-collection-item]') ?? []),
        ]
        ;(triggers[1] as HTMLElement | undefined)?.focus()
      })
      await session.pressKey('ArrowDown')
      const activeAfterSkip = await session.evaluate(() => {
        const multiRoot = document.querySelectorAll('.example-surface')[1]?.firstElementChild
        const triggers = [
          ...(multiRoot?.querySelectorAll('button[data-reka-collection-item]') ?? []),
        ]
        return triggers.indexOf(document.activeElement as Element)
      })
      assert.notEqual(activeAfterSkip, 2)

      // Verify theme switching updates Accordion background, border, trigger, and content colours.
      await switchTheme(session, 'light')
      const lightColors = await session.evaluate(() => {
        const root = document.querySelectorAll('.example-surface')[0]
          ?.firstElementChild as HTMLElement
        const item = root.querySelector('[data-orientation]') as HTMLElement
        const trigger = root.querySelector('button[data-reka-collection-item]') as HTMLElement
        const region = root.querySelector('[role="region"]') as HTMLElement
        return {
          bg: getComputedStyle(root).backgroundColor,
          border: getComputedStyle(item).borderBottomColor,
          triggerColor: getComputedStyle(trigger).color,
          regionColor: getComputedStyle(region).color,
        }
      })
      const lightTokens = await resolveThemeTokens(session)
      assert.equal(lightColors.bg, lightTokens.raised)
      assert.equal(lightColors.border, lightTokens.line)
      assert.equal(lightColors.triggerColor, lightTokens.ink)
      assert.equal(lightColors.regionColor, lightTokens.inkMuted)

      await switchTheme(session, 'dark')
      const darkColors = await session.evaluate(() => {
        const root = document.querySelectorAll('.example-surface')[0]
          ?.firstElementChild as HTMLElement
        const item = root.querySelector('[data-orientation]') as HTMLElement
        const trigger = root.querySelector('button[data-reka-collection-item]') as HTMLElement
        const region = root.querySelector('[role="region"]') as HTMLElement
        return {
          bg: getComputedStyle(root).backgroundColor,
          border: getComputedStyle(item).borderBottomColor,
          triggerColor: getComputedStyle(trigger).color,
          regionColor: getComputedStyle(region).color,
        }
      })
      const darkTokens = await resolveThemeTokens(session)
      assert.equal(darkColors.bg, darkTokens.raised)
      assert.equal(darkColors.border, darkTokens.line)
      assert.equal(darkColors.triggerColor, darkTokens.ink)
      assert.equal(darkColors.regionColor, darkTokens.inkMuted)
      assert.notEqual(lightColors.bg, darkColors.bg)
      assert.notEqual(lightColors.triggerColor, darkColors.triggerColor)

      await switchTheme(session, 'system')
      assert.deepEqual(session.errors, [])
    })
  })
})
