import { defineComponent, h, watchEffect, type App } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { ThemeProvider, useTheme } from '@/components/ui/theme-provider'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import Example from './Example.vue'
import './site.css'

/**
 * VitePress drives its chrome from `isDark`, which it derives from its own storage
 * key and a `dark` class. p0seid0n drives the tokens the same way, so the two are
 * bridged here in one direction: the provider is the source of truth and VitePress
 * follows it. Without this, the site toggle and the component tokens could disagree.
 */
const HeaderThemeSwitcher = defineComponent({
  name: 'HeaderThemeSwitcher',
  setup() {
    const { resolvedTheme } = useTheme()
    const { isDark } = useData()

    watchEffect(() => {
      isDark.value = resolvedTheme.value === 'dark'
    })

    return () =>
      h(
        ThemeSwitcher,
        { label: 'Appearance' },
        {
          icon: () =>
            h(
              'span',
              { class: 'text-[12px] font-medium', 'aria-hidden': 'true' },
              resolvedTheme.value === 'dark' ? 'Dark' : 'Light',
            ),
        },
      )
  },
})

export default {
  extends: DefaultTheme,
  Layout: defineComponent({
    name: 'DocsLayout',
    setup(_, { slots }) {
      return () =>
        h(ThemeProvider, { defaultTheme: 'system' }, {
          default: () =>
            h(DefaultTheme.Layout, null, {
              'nav-bar-content-after': () => h(HeaderThemeSwitcher),
              ...slots,
            }),
        })
    },
  }),
  enhanceApp({ app }: { app: App }) {
    app.component('Example', Example)
  },
}
