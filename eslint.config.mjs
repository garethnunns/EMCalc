import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default [
  { ignores: ['web-build/', 'dist/', '.expo/'] },
  js.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      // Metro bundles images with require()
      globals: { ...globals.browser, require: 'readonly' },
    },
    rules: {
      // drop state keys by destructuring them out
      'no-unused-vars': ['error', { ignoreRestSiblings: true }],
      // storage, history and service worker calls fail quietly in some browsers
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  // Electron's main process is CommonJS on Node
  {
    files: ['electron/**/*.js'],
    languageOptions: { sourceType: 'commonjs', globals: { ...globals.node } },
  },
  {
    files: ['scripts/**', 'eslint.config.mjs'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['public/*.js'],
    languageOptions: { globals: { ...globals.serviceworker } },
  },
  {
    files: ['test/**'],
    languageOptions: { globals: { ...globals.node, ...globals.mocha } },
  },
]
