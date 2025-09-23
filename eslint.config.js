import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        chrome: 'readonly',
        fetch: 'readonly',
        navigator: 'readonly',
        alert: 'readonly',
        YT: 'readonly',
        setTimeout: 'readonly',
        MutationObserver: 'readonly',
        location: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'warn'
    }
  }
];
