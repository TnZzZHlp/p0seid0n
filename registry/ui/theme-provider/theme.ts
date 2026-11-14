export type ThemeChoice = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export const DEFAULT_STORAGE_KEY = 'p0seid0n-theme'

/** Reads the stored choice; anything unrecognised falls back to `system`. */
export function readStoredTheme(storageKey: string): ThemeChoice {
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Storage can be blocked (private mode, third-party context); system is the safe answer.
  }
  return 'system'
}

export function systemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * The class on `html` is the only thing the stylesheet reads. `system` removes both
 * classes so `color-scheme: light dark` keeps following the OS, which a pinned class
 * would stop doing.
 */
export function applyThemeToDocument(choice: ThemeChoice, attribute: string): ResolvedTheme {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  const resolved: ResolvedTheme = choice === 'system' ? systemTheme() : choice
  if (choice !== 'system') root.classList.add(choice)
  // The attribute mirrors the explicit choice for selectors that need it; `system`
  // omits it so styles can tell "unset" apart from a pinned light.
  if (choice === 'system') root.removeAttribute(attribute)
  else root.setAttribute(attribute, choice)
  return resolved
}

/**
 * Inline this in `<head>` before the app bundle so a stored choice paints on the
 * first frame. It touches only `<html>` and never the framework state, so there is
 * nothing for hydration to disagree with.
 */
export function themeScript(
  storageKey: string = DEFAULT_STORAGE_KEY,
  attribute: string = 'data-theme',
): string {
  return `(()=>{try{var r=document.documentElement,k=${JSON.stringify(storageKey)},a=${JSON.stringify(attribute)},s=localStorage.getItem(k);r.classList.remove("light","dark");if(s==="light"||s==="dark"){r.classList.add(s);r.setAttribute(a,s)}else{r.removeAttribute(a)}}catch(e){}})()`
}
