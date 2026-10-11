import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['warn', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // Accessibility is a requirement, not a suggestion.
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/label-has-associated-control': 'off', // Field wires labels via htmlFor + context
      'jsx-a11y/no-autofocus': 'off', // date picker focuses the calendar grid on open (expected)
    },
  },
  {
    ignores: [
      '.next/',
      '.next-e2e/',
      'playwright-report/',
      'test-results/',
      'node_modules/',
      'media/',
      'src/payload-types.ts',
      'src/app/(payload)/',
      'src/migrations/',
      'src/components/brand/logo-geometry.ts',
    ],
  },
]

export default config
