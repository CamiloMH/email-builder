import { baseConfig } from '@email/eslint-config/base';

export default [
  ...baseConfig,
  { ignores: ['dist/**', 'coverage/**'] },
  {
    // NestJS relies on value imports for `emitDecoratorMetadata` (DI).
    files: ['**/*.ts'],
    rules: { '@typescript-eslint/consistent-type-imports': 'off' },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { module: 'writable', require: 'readonly', process: 'readonly' },
    },
  },
];
