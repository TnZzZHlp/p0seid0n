import assert from 'node:assert/strict'
import { test } from 'node:test'

import { BrowserSession } from './browser.ts'

test('Enter toggles the focused switch', async () => {
  const session = await BrowserSession.launch()
  try {
    await session.goto('/components/switch')
    await session.evaluate(() => document.getElementById('switch-off')?.focus())

    await session.pressKey('Enter')
    await session.waitFor(
      () => document.getElementById('switch-off')?.getAttribute('aria-checked') === 'true',
    )

    // Thumb must stay inside its track when checked (no margin-inline-start + translate stacking).
    const bounds = await session.evaluate(() => {
      const track = document.querySelector('.example-surface [data-slot="switch"][data-checked]')
      const thumb = track?.querySelector('[data-slot="switch-thumb"]')
      if (!track || !thumb) return null
      const tr = track.getBoundingClientRect()
      const th = thumb.getBoundingClientRect()
      return { trackLeft: tr.left, trackRight: tr.right, thumbLeft: th.left, thumbRight: th.right }
    })
    assert.ok(bounds)
    assert.ok(bounds.thumbLeft >= bounds.trackLeft, 'thumb overflowed track on the left')
    assert.ok(bounds.thumbRight <= bounds.trackRight, 'thumb overflowed track on the right')
    assert.deepEqual(session.errors, [])
  } finally {
    await session.close()
  }
})
