// @ts-check
/* eslint-disable */

const { defineConfig } = require('eslint/config');
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {},
});

module.exports = defineConfig([
  ...compat.config({
    extends: ['next/core-web-vitals', '@aswinsvijay/eslint-config'],
    ignorePatterns: ['dist/**/*'],
    rules: {
      'react-hooks/exhaustive-deps': [
        'warn',
        {
          additionalHooks: '(useMemoizedParameters)',
        },
      ],
    },
  }),
]);
