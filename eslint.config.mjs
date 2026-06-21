import globals from 'globals';
import { baseConfig } from '@email/eslint-config/base';

/**
 * Root ESLint flat configuration. Used when linting from the repository root
 * (e.g. by lint-staged in the pre-commit hook). Each workspace also has its own
 * `eslint.config.mjs` that reuses the same shared rules.
 */
export default [
  {
    ignores: ['**/dist/**', '**/.next/**', '**/.turbo/**', '**/coverage/**', '**/node_modules/**'],
  },
  ...baseConfig,
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.{mjs,js}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    // NestJS relies on value imports for `emitDecoratorMetadata` (DI), so the
    // type-imports rule must not rewrite them.
    files: ['apps/backend/**/*.ts'],
    rules: { '@typescript-eslint/consistent-type-imports': 'off' },
  },
  {
    // Frontend runs in the browser; provide browser globals and don't force (or
    // auto-insert) per-prop JSDoc on React components when linting from the root.
    files: ['apps/frontend/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
    },
  },
];
