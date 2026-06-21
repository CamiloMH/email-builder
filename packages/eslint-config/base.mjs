import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/**
 * Shared flat ESLint configuration for all TypeScript packages in the monorepo.
 *
 * Bundles the recommended JS + typescript-eslint rules, enforces JSDoc on the
 * public API (warnings, so missing docs do not block commits but malformed docs
 * do), and disables stylistic rules that conflict with Prettier.
 *
 * @type {import('typescript-eslint').ConfigArray}
 */
export const baseConfig = tseslint.config(
  { ignores: ['dist/**', 'coverage/**', '.turbo/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsdoc.configs['flat/recommended-typescript'],
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
      'jsdoc/require-jsdoc': [
        'warn',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
          },
        },
      ],
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns-type': 'off',
      'jsdoc/tag-lines': ['warn', 'any', { startLines: 1 }],
      'jsdoc/check-tag-names': [
        'warn',
        { definedTags: ['packageDocumentation', 'typeParam', 'remarks'] },
      ],
    },
  },
  prettier,
);

export default baseConfig;
