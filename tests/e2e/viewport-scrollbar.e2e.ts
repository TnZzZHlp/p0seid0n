import assert from 'node:assert/strict'
import { test } from 'node:test'

import { BrowserSession } from './browser.ts'

test('an overflowing docs page keeps the full viewport width', async () => {
  const session = await BrowserSession.launch()
  try {
    await session.goto('/guide/install')
    const layout = await session.waitFor(() => {
      const track = document.querySelector('.viewport-scrollbar[data-scrollable]')
      if (!track) return false

      return {
        overflow: document.scrollingElement!.scrollHeight > document.documentElement.clientHeight,
        viewport: window.innerWidth,
        layout: document.documentElement.clientWidth,
      }
    })

    assert.equal(layout.overflow, true)
    assert.equal(layout.layout, layout.viewport)
    assert.deepEqual(session.errors, [])
  } finally {
    await session.close()
  }
})
