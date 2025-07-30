import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        require: true,
        module: true,
        process: true,
        __dirname: true
      }
    },
    rules: {
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': 'error',
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
      indent: ['error', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'never']
    }
  }
])
