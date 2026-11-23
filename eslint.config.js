// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

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
      '@typescript-eslint/no-explicit-any': 'error',
      // Toasts go through src/ui/toast.ts only.
      'no-restricted-imports': [
        'error',
        { paths: [{ name: 'sonner-native', message: "Import { toast } from '@/ui' instead." }] },
      ],
      // DESIGN.md: no raw hex outside src/theme and brand/.
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
    files: ['src/ui/toast.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['src/theme/**/*.{ts,tsx}', 'src/**/__tests__/**'],
    rules: { 'no-restricted-syntax': 'off' },
  },
]);
