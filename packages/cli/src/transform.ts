import type { ComponentsConfig } from './config.ts'

/**
 * Rewrites registry `@/...` module specifiers inside installed TypeScript and Vue
 * files to match the consumer's `components.json` aliases. When the consumer uses
 * the default `@/...` aliases, the returned string is byte-identical to `content`.
 */
export function rewriteImports(
  content: string,
  filePath: string,
  config: ComponentsConfig,
): string {
  if (!/\.(vue|ts|tsx|js|jsx)$/.test(filePath)) return content

  const uiAlias = config.aliases.ui.replace(/\/+$/, '')
  const libAlias = config.aliases.lib.replace(/\/+$/, '')
  const utilsAlias = config.aliases.utils.replace(/\.ts$/, '')
  const componentsAlias = config.aliases.components.replace(/\/+$/, '')

  return content.replace(
    /((?:from|import)\s*\(?\s*['"])(@\/[^'"]+)(['"])/g,
    (full, lead: string, specifier: string, quote: string) => {
      if (specifier === '@/lib/utils') {
        return `${lead}${utilsAlias}${quote}`
      }
      if (specifier.startsWith('@/lib/')) {
        return `${lead}${libAlias}/${specifier.slice('@/lib/'.length)}${quote}`
      }
      if (specifier.startsWith('@/components/ui/')) {
        return `${lead}${uiAlias}/${specifier.slice('@/components/ui/'.length)}${quote}`
      }
      if (specifier.startsWith('@/ui/')) {
        return `${lead}${uiAlias}/${specifier.slice('@/ui/'.length)}${quote}`
      }
      if (specifier.startsWith('@/components/')) {
        return `${lead}${componentsAlias}/${specifier.slice('@/components/'.length)}${quote}`
      }
      return full
    },
  )
}
