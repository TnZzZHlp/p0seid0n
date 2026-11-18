import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitepress'

const srcDir = fileURLToPath(new URL('../src', import.meta.url))

export default defineConfig({
  // VitePress copies `<srcDir>/public` verbatim and ignores a custom publicDir, so
  // srcDir stays at src/ and the page tree is lifted out of it with rewrites. The
  // registry JSON is staged into src/public by `pnpm ui:install` for the same
  // reason: /r/*.json has to ship with the site.
  srcDir: 'src',
  rewrites: {
    'pages/:rest*': ':rest*',
  },
  title: 'P0seid0n',
  description: 'A Vue UI registry: install the source, own the styles.',
  lang: 'en-GB',
  cleanUrls: true,
  // Disable VitePress's built-in appearance toggle; HeaderThemeSwitcher in the
  // custom theme layout provides the single three-state ThemeSwitcher control.
  appearance: false,
  head: [
    // Applies a stored choice before the first paint, matching themeScript().
    [
      'script',
      {},
      `(()=>{try{var r=document.documentElement,k="p0seid0n-theme",a="data-theme",s=localStorage.getItem(k);r.classList.remove("light","dark");if(s==="light"||s==="dark"){r.classList.add(s);r.setAttribute(a,s)}else{r.removeAttribute(a)}}catch(e){}})()`,
    ],
  ],
  themeConfig: {
    logo: undefined,
    nav: [
      { text: 'Guide', link: '/guide/install' },
      { text: 'Components', link: '/components/button' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Introduction', link: '/' },
            { text: 'Install', link: '/guide/install' },
            { text: 'Theme and tokens', link: '/guide/theme' },
            { text: 'Typography and breakpoints', link: '/guide/typography' },
          ],
        },
      ],
      '/components/': [
        {
          text: 'Core controls',
          items: [
            { text: 'Button', link: '/components/button' },
            { text: 'Badge', link: '/components/badge' },
            { text: 'Separator', link: '/components/separator' },
            { text: 'Card', link: '/components/card' },
            { text: 'Input', link: '/components/input' },
            { text: 'Label', link: '/components/label' },
            { text: 'Switch', link: '/components/switch' },
          ],
        },
        {
          text: 'Overlays and navigation',
          items: [
            { text: 'Dropdown menu', link: '/components/dropdown-menu' },
            { text: 'Tooltip', link: '/components/tooltip' },
            { text: 'Dialog', link: '/components/dialog' },
            { text: 'Tabs', link: '/components/tabs' },
            { text: 'Toast', link: '/components/toast' },
          ],
        },
        {
          text: 'Data display',
          items: [
            { text: 'Stat', link: '/components/stat' },
            { text: 'Sparkline', link: '/components/sparkline' },
            { text: 'Theme switcher', link: '/components/theme-switcher' },
          ],
        },
      ],
    },
    outline: { level: [2, 3] },
    search: { provider: 'local' },
  },
  vite: {
    // VitePress bundles its own Vite major, so its plugin type and the one
    // @tailwindcss/vite declares do not unify. The runtime object is compatible.
    plugins: [tailwindcss() as never],
    resolve: {
      alias: {
        // The installed artifacts are the only component source; nothing here
        // points at registry/.
        '@': srcDir,
      },
    },
  },
})
