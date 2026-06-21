/**
 * Commitlint configuration enforcing the Conventional Commits specification.
 * Wired into the `commit-msg` Husky hook so every commit message is validated.
 *
 * @see https://www.conventionalcommits.org
 * @type {import('@commitlint/types').UserConfig}
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
  },
};
