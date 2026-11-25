// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

// AGENTS.md "Code style": react/react-native, libraries, App* kit, features, theme, app-level, relative.
const IMPORT_ORDER = {
  groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
  pathGroups: [
    { pattern: 'react', group: 'builtin' },
    { pattern: 'react-native', group: 'builtin' },
    { pattern: '@/shared/components{,/**}', group: 'internal', position: 'before' },
    { pattern: '{.,..}/App*', group: 'internal', position: 'before' },
    { pattern: '@/features/**', group: 'internal' },
    { pattern: '{.,..}/components/**', group: 'internal' },
    { pattern: './[A-Z]*', group: 'internal' },
    { pattern: '@/shared/theme{,/**}', group: 'internal', position: 'after' },
    {
      pattern: '{@/core,@/shared/utils,@/shared/assets,@brand}/**',
      group: 'parent',
      position: 'before',
    },
  ],
  pathGroupsExcludedImportTypes: [],
  'newlines-between': 'always',
  alphabetize: { order: 'asc', caseInsensitive: true },
};

const HEX_COLOR = '/#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/';

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', 'ios/*', 'android/*', 'example/*', '.expo/*'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'error',
      'import/order': ['error', IMPORT_ORDER],
      '@typescript-eslint/no-explicit-any': 'error',
      // Toasts go through src/shared/utils/toast.ts only.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'sonner-native',
              message: "Import { toast } from '@/shared/utils/toast' instead.",
            },
          ],
        },
      ],
      // DESIGN.md: no raw hex outside src/shared/theme and brand/.
      'no-restricted-syntax': [
        'error',
        {
          selector: `Literal[value=${HEX_COLOR}]`,
          message: 'Use theme tokens (useTheme().colors) instead of hex colours.',
        },
        {
          selector: `TemplateElement[value.raw=${HEX_COLOR}]`,
          message: 'Use theme tokens (useTheme().colors) instead of hex colours.',
        },
      ],
    },
  },
  {
    files: ['src/shared/utils/toast.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['src/shared/theme/**/*.{ts,tsx}', 'src/**/__tests__/**'],
    rules: { 'no-restricted-syntax': 'off' },
  },
]);
