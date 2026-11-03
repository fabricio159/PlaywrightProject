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
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
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
