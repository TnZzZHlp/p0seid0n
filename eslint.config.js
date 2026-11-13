import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const emojiPattern = new RegExp('\\p{Extended_Pictographic}', 'gu')

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

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      'dist/',
      'apps/docs/.vitepress/dist/',
      'apps/docs/.vitepress/cache/',
      'apps/docs/public/r/',
      'apps/docs/src/components/ui/',
      'apps/docs/src/lib/utils.ts',
      'apps/docs/src/styles/ocean.css',
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
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    plugins: {
      ocean: { rules: { 'no-emoji': noEmoji } },
    },
    rules: {
      'ocean/no-emoji': 'error',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  prettier,
)
