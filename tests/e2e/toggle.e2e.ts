import assert from 'node:assert/strict'
import { test } from 'node:test'

import { BrowserSession } from './browser.ts'

test('Toggle preserves width with icon+text, honours defaultValue, and styles pressed state', async () => {
  const session = await BrowserSession.launch()
  try {
    await session.goto('/components/toggle')

    const initial = await session.evaluate(() => {
      const toggles = [
        ...document.querySelectorAll<HTMLButtonElement>('.example-surface [data-slot="toggle"]'),
      ]
      return toggles.map((el) => ({
        text: el.textContent?.trim() ?? '',
        ariaPressed: el.getAttribute('aria-pressed'),
        dataPressed: el.hasAttribute('data-pressed'),
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        width: el.getBoundingClientRect().width,
      }))
    })

    assert.equal(initial.length, 4)
    assert.ok(
      initial[0].scrollWidth <= initial[0].clientWidth + 1 && initial[0].width > 60,
      `icon+label toggle collapsed or overflowed: ${JSON.stringify(initial[0])}`,
    )
    assert.equal(initial[3].text, 'Locked')
    assert.equal(initial[3].ariaPressed, 'true')
    assert.equal(initial[3].dataPressed, true)

    await session.click('.example-surface [data-slot="toggle"]', 1)
    await session.waitFor(() => {
      const pin = document.querySelectorAll('.example-surface [data-slot="toggle"]').item(1)
      return pin?.getAttribute('aria-pressed') === 'true' && pin.hasAttribute('data-pressed')
    })

    assert.deepEqual(session.errors, [])
  } finally {
    await session.close()
  }
})
