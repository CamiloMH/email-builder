import globals from 'globals';
import { baseConfig } from './base.mjs';

/**
 * Flat ESLint configuration for React / Next.js packages.
 *
 * Extends the shared {@link baseConfig} with browser globals. Next.js apps
 * additionally compose this with `eslint-config-next` in their own config file.
 *
 * @type {import('typescript-eslint').ConfigArray}
 */
export const reactConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      // React components are documented via their TypeScript prop types and
      // optional free-form JSDoc; per-prop @param/@returns are not required.
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
    },
  },
];

export default reactConfig;
