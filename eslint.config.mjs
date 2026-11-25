import js from '@eslint/js';
import globals from 'globals';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      '**/node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'playwright/.auth/**',
      '.features-gen/**',
      'cucumber/reports/**',
      'allure-results/**',
      'allure-report/**',
      'mutation-results/**',
      'mutation-allure-report/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.js', 'mutation/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
  {
    files: ['tests/**/*.js'],
    ...playwright.configs['flat/recommended'],
  },
  prettier,
];
