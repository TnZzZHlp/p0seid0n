import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, postcssIsolateStyles } from 'vitepress'

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
            { text: 'Motion', link: '/guide/motion' },
          ],
        },
      ],
      '/components/': [
        {
          text: 'Core controls',
          items: [
            { text: 'Button', link: '/components/button' },
            { text: 'Toggle', link: '/components/toggle' },
            { text: 'Badge', link: '/components/badge' },
            { text: 'Separator', link: '/components/separator' },
            { text: 'Card', link: '/components/card' },
            { text: 'Input', link: '/components/input' },
            { text: 'Textarea', link: '/components/textarea' },
            { text: 'Label', link: '/components/label' },
            { text: 'Checkbox', link: '/components/checkbox' },
            { text: 'Radio group', link: '/components/radio-group' },
            { text: 'Select', link: '/components/select' },
            { text: 'Switch', link: '/components/switch' },
            { text: 'Slider', link: '/components/slider' },
          ],
        },
        {
          text: 'Overlays and navigation',
          items: [
            { text: 'Command', link: '/components/command' },
            { text: 'Dropdown menu', link: '/components/dropdown-menu' },
            { text: 'Popover', link: '/components/popover' },
            { text: 'Tooltip', link: '/components/tooltip' },
            { text: 'Dialog', link: '/components/dialog' },
            { text: 'Alert dialog', link: '/components/alert-dialog' },
            { text: 'Sheet', link: '/components/sheet' },
            { text: 'Accordion', link: '/components/accordion' },
            { text: 'Tabs', link: '/components/tabs' },
            { text: 'Breadcrumb', link: '/components/breadcrumb' },
            { text: 'Pagination', link: '/components/pagination' },
            { text: 'Toast', link: '/components/toast' },
          ],
        },
        {
          text: 'Data display',
          items: [
            { text: 'Alert', link: '/components/alert' },
            { text: 'Progress', link: '/components/progress' },
            { text: 'Skeleton', link: '/components/skeleton' },
            { text: 'Avatar', link: '/components/avatar' },
            { text: 'Table', link: '/components/table' },
            { text: 'Stat', link: '/components/stat' },
            { text: 'Sparkline', link: '/components/sparkline' },
            { text: 'Area chart', link: '/components/area-chart' },
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
    css: {
      postcss: {
        // Scope VitePress base/doc typography rules away from `.vp-raw` live examples.
        plugins: [postcssIsolateStyles({ includeFiles: [/vp-doc\.css/, /base\.css/] }) as never],
      },
    },
    resolve: {
      alias: {
        // The installed artifacts are the only component source; nothing here
        // points at registry/.
        '@': srcDir,
      },
    },
  },
})
