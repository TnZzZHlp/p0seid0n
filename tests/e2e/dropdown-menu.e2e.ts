import assert from 'node:assert/strict'
import { test } from 'node:test'

import { BrowserSession } from './browser.ts'

test('a standalone dropdown menu label renders when the menu opens', async () => {
  const session = await BrowserSession.launch()
  try {
    await session.goto('/components/dropdown-menu')
    await session.click('.example-surface button[aria-haspopup="menu"]')
    await session.waitFor(() =>
      document.querySelector('[role="menu"]')?.textContent?.includes('Session'),
    )
    assert.deepEqual(session.errors, [])
  } finally {
    await session.close()
  }
})
