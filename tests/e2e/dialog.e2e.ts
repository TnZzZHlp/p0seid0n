import assert from 'node:assert/strict'
import { test } from 'node:test'

import { BrowserSession } from './browser.ts'

test('Escape dismisses a dialog and restores focus to its trigger', async () => {
  const session = await BrowserSession.launch()
  try {
    await session.goto('/components/dialog')
    const trigger = '.example-surface button[aria-haspopup="dialog"]'
    await session.click(trigger)
    await session.waitFor(() => document.querySelector('[role="dialog"]') !== null)

    await session.pressKey('Escape')
    await session.waitFor(
      (selector) =>
        document.querySelector('[role="dialog"]') === null &&
        document.activeElement === document.querySelector(selector),
      [trigger],
    )
    assert.deepEqual(session.errors, [])
  } finally {
    await session.close()
  }
})

test('a close-auto-focus handler can move focus away from the dialog trigger', async () => {
  const session = await BrowserSession.launch()
  try {
    await session.goto('/components/dialog')
    await session.click('.example-surface button[aria-haspopup="dialog"]')
    await session.waitFor(() => document.querySelector('[role="dialog"]') !== null)
    await session.evaluate(() => {
      const buttons = [...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')]
      buttons.find((button) => button.textContent?.trim() === 'Delete')?.click()
    })

    await session.waitFor(
      () =>
        document.querySelector('[role="dialog"]') === null &&
        document.activeElement?.textContent?.trim() === 'deleted',
    )
    assert.deepEqual(session.errors, [])
  } finally {
    await session.close()
  }
})
