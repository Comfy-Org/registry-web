# Translation Files

## en.json

This empty `en.json` file exists to satisfy the `@spaced-out/eslint-plugin-i18n` plugin configuration.

The plugin has a hardcoded path to `src/components/lib/i18n/translations/en.json` in its utilities file and attempts to stat this file during initialization. Without this file, ESLint will fail to load the plugin.

**Note:** The actual translation files for this application are located in the `./locales/` directory at the project root, not in this directory. This file is kept empty and serves only as a placeholder for the ESLint plugin.

## Actual Translation Location

The real i18n translations are maintained in:

- `./locales/en/common.json` - English (default)
- `./locales/zh/common.json` - Chinese
- `./locales/ja/common.json` - Japanese
- `./locales/fr/common.json` - French
- `./locales/es/common.json` - Spanish
- `./locales/ko/common.json` - Korean
- `./locales/ru/common.json` - Russian
- `./locales/ar/common.json` - Arabic
- `./locales/tr/common.json` - Turkish
