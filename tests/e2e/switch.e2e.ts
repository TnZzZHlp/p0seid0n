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
    assert.deepEqual(session.errors, [])
  } finally {
    await session.close()
  }
})
