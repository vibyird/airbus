import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import vue from 'eslint-plugin-vue'
import { defineConfig, globalIgnores, includeIgnoreFile } from 'eslint/config'
import globals from 'globals'
import path from 'path'
import ts from 'typescript-eslint'

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore')

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  globalIgnores(['worker-configuration.d.ts']),
  js.configs.recommended,
  ts.configs.recommended,
  vue.configs['flat/recommended'],
  prettier,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
      // see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: ts.parser } },
  },
  {
    // override/add rules settings here, such as:
    // 'vue/no-unused-vars': 'error'
    rules: {
      'vue/multi-word-component-names': 'off', // 完全关闭多单词组件名校验
    },
  },
)
