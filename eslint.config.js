import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const emojiPattern = new RegExp('\\p{Extended_Pictographic}', 'gu')
const rawColorPattern =
  /(?<!&)#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\b|\b(?:rgba?|hsla?)\s*\(/g
const darkVariantPattern = /(?:^|[\s'"`])dark:[a-zA-Z0-9_-]+/g

const noEmoji = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow emoji in any source text' },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const source = context.sourceCode.getText()
        emojiPattern.lastIndex = 0
        let match = emojiPattern.exec(source)
        while (match) {
          const start = match.index
          const end = start + match[0].length
          context.report({
            node,
            loc: {
              start: context.sourceCode.getLocFromIndex(start),
              end: context.sourceCode.getLocFromIndex(end),
            },
            message: 'Emoji are not allowed anywhere in this repository.',
          })
          match = emojiPattern.exec(source)
        }
      },
    }
  },
}

const noRawColors = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded colour literals outside registry/styles/p0seid0n.css',
    },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const source = context.sourceCode.getText()
        rawColorPattern.lastIndex = 0
        let match = rawColorPattern.exec(source)
        while (match) {
          const start = match.index
          const end = start + match[0].length
          context.report({
            node,
            loc: {
              start: context.sourceCode.getLocFromIndex(start),
              end: context.sourceCode.getLocFromIndex(end),
            },
            message:
              'Hardcoded colour literals are only permitted in registry/styles/p0seid0n.css; use semantic token utilities instead.',
          })
          match = rawColorPattern.exec(source)
        }
      },
    }
  },
}

const noDarkVariant = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow Tailwind dark: variants in component source' },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const source = context.sourceCode.getText()
        darkVariantPattern.lastIndex = 0
        let match = darkVariantPattern.exec(source)
        while (match) {
          const start = match.index
          const end = start + match[0].length
          context.report({
            node,
            loc: {
              start: context.sourceCode.getLocFromIndex(start),
              end: context.sourceCode.getLocFromIndex(end),
            },
            message:
              'dark: variants are not allowed; light and dark are driven by light-dark() tokens.',
          })
          match = darkVariantPattern.exec(source)
        }
      },
    }
  },
}

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      'dist/',
      '.wrangler/',
      'packages/cli/dist/',
      'packages/cli/*.tgz',
      'apps/docs/.vitepress/dist/',
      'apps/docs/.vitepress/cache/',
      'apps/docs/public/r/',
      'apps/docs/src/components/ui/',
      'apps/docs/src/lib/utils.ts',
      'apps/docs/src/styles/',
      'apps/docs/src/public/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },
  {
    // A VitePress theme composes its layout and a header slot in one module; the
    // theme contract is a single default export, so the rule does not apply.
    files: ['apps/docs/.vitepress/theme/index.ts'],
    rules: { 'vue/one-component-per-file': 'off' },
  },
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    plugins: {
      p0seid0n: {
        rules: {
          'no-emoji': noEmoji,
          'no-raw-colors': noRawColors,
          'no-dark-variant': noDarkVariant,
        },
      },
    },
    rules: {
      'p0seid0n/no-emoji': 'error',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['registry/ui/**/*.{vue,ts}', 'registry/lib/**/*.ts'],
    rules: {
      'p0seid0n/no-raw-colors': 'error',
      'p0seid0n/no-dark-variant': 'error',
    },
  },
  prettier,
)
