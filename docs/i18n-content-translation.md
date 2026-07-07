# i18n Content Translation — Related PRs & Issues

This document collects all PRs, issues, and resources related to making **dynamic content** (node descriptions, changelogs, metadata) automatically translated, beyond the existing static UI text i18n.

## Current State

- **Static UI text i18n**: ✅ Complete (45 components, 189+ keys, 7+ languages)
- **Content i18n (node descriptions, changelogs, metadata)**: 🚧 In progress — ISR-time translation and page updates implemented, broader translation tooling still evolving
- **Branch**: `sno-i18n-isr` — implementation branch for content i18n + ISR (Incremental Static Regeneration)

---

## Related PRs

### Merged (Foundation)

| PR                                                         | Title                                           | Status    | Description                                                                                                                                             |
| ---------------------------------------------------------- | ----------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#129](https://github.com/Comfy-Org/registry-web/pull/129) | Sno i18n                                        | ✅ Merged | Initial comprehensive i18n implementation: 45 components, 189 keys, react-i18next, language switcher, CI/CD auto-translation pipeline, en/zh/ja support |
| [#164](https://github.com/Comfy-Org/registry-web/pull/164) | Move i18n locales from public/ to root locales/ | ✅ Merged | Moved locale files from `public/locales/` → `locales/` directory, updated import paths and scan script                                                  |

### Open (Content Translation)

| PR                                                         | Title                                                           | Status          | Description                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------- | --------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#198](https://github.com/Comfy-Org/registry-web/pull/198) | feat: enhance browser translation with dynamic translation hook | 🟡 Open         | **Key PR for content i18n.** Adds `useDynamicTranslate` hook using Chrome's experimental Translator API (Chrome 138+). Browser-based, local translation of node descriptions and changelogs. Toggle in language dropdown. Falls back gracefully. Client-side only (no SSR/SEO benefit). |
| [#179](https://github.com/Comfy-Org/registry-web/pull/179) | feat: add node translation editor for i18n management           | 🟡 Open (Draft) | Adds `/nodes/[nodeId]/i18n` page for editing node translations. Multi-language translation UI with field management. Auth-protected. Storybook stories included. Requires backend API for storing translations.                                                                         |

### Open (Infrastructure / Related)

| PR                                                         | Title                                            | Status          | Description                                                                                                                                                                                               |
| ---------------------------------------------------------- | ------------------------------------------------ | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#233](https://github.com/Comfy-Org/registry-web/pull/233) | feat: Migrate from pages directory to app router | 🟡 Open (Draft) | App Router migration. Prerequisite for proper ISR, Server Components, streaming. Currently wraps Pages Router components with `'use client'`. i18n config needs reimplementation for App Router patterns. |
| [#211](https://github.com/Comfy-Org/registry-web/pull/211) | Add i18n ESLint plugin configuration             | 🟡 Open (Draft) | `eslint-plugin-i18n-json` / `@spaced-out/eslint-plugin-i18n` for validating translation JSON files. Enforces sorted keys, identical keys across locales, valid JSON.                                      |
| [#255](https://github.com/Comfy-Org/registry-web/pull/255) | ci: run Next.js CI on all pull requests          | 🟡 Open         | CI pipeline improvements                                                                                                                                                                                  |

### Merged (Language Additions)

| PR                                                         | Title                                    | Status    | Description                                                                                                    |
| ---------------------------------------------------------- | ---------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------- |
| [#171](https://github.com/Comfy-Org/registry-web/pull/171) | Add experimental Arabic language support | ✅ Merged | Arabic (RTL) support with Beta label, RTL text direction, build dependency fixes, community translation review |
| [#217](https://github.com/Comfy-Org/registry-web/pull/217) | feat: add Turkish language support       | ❓ Verify | Turkish language addition (status needs verification — `prbot` may misreport merged PRs as "closed")           |

---

## Approaches Explored

### 1. Browser-based Dynamic Translation (PR #198)

- **Mechanism**: Chrome's built-in Translator API (Chrome 138+)
- **Pros**: No server costs, works offline after model download, opt-in
- **Cons**: Chrome-only, not available in all regions (e.g., China), no SSR/SEO benefit, client-side only
- **Status**: Working prototype, open PR

### 2. Node Translation Editor (PR #179)

- **Mechanism**: Manual translation editing UI at `/nodes/[nodeId]/i18n`
- **Pros**: Human-quality translations, full control
- **Cons**: Requires backend API for translation storage, manual effort
- **Status**: Draft PR, needs backend support

### 3. Server-side Content Translation with ISR (this branch: `sno-i18n-isr`)

- **Mechanism**: Translate content at build/ISR time, serve pre-translated pages per locale
- **Pros**: SEO-friendly, works in all browsers, fast page loads
- **Cons**: Requires translation API integration, ISR infrastructure, storage for translations
- **Status**: ✅ Implemented — ISR-time translation with OpenAI auto-translate for node detail pages

---

## Architecture Considerations for Content i18n + ISR

### What needs translating (dynamic content)

- Node descriptions (from API/database)
- Version changelogs
- Publisher descriptions
- Node metadata (author, license labels are already static)

### Possible implementation paths

1. **Pre-translate at API level**: Backend stores translations per locale, API returns localized content based on `Accept-Language` header
2. **Translate at ISR/SSG time**: Fetch English content → translate via OpenAI/translation API → cache with ISR revalidation
3. **Hybrid**: Store community-edited translations (PR #179) + auto-translate missing ones (PR #198 approach but server-side)

### ISR integration points

- `getStaticProps` with `revalidate` for node detail pages
- Locale-specific paths via `getStaticPaths` with `locales` config
- Cache translated content to avoid repeated API translation calls

---

## Key Files

| File                      | Purpose                                              |
| ------------------------- | ---------------------------------------------------- |
| `src/hooks/i18n/index.ts` | Main i18n hook (`useNextTranslation`)                |
| `middleware.ts`           | Language detection, locale routing                   |
| `scripts/scan-i18n.ts`    | Extract translation keys, auto-translate with OpenAI |
| `locales/*/common.json`   | Static UI translation files                          |
| `src/constants.ts`        | `SUPPORTED_LANGUAGES`, `LANGUAGE_NAMES`              |
| `next.config.ts`          | i18n configuration                                   |
| `docs/i18n.md`            | Existing i18n documentation                          |

---

## Next Steps

1. **Design**: Decide between pre-translated API responses vs ISR-time translation
2. **Backend**: Check if registry API supports locale-specific content endpoints
3. **Translation storage**: Where to store translated node descriptions (DB? file cache?)
4. **ISR setup**: Configure `getStaticProps` with `revalidate` for node pages with locale variants
5. **SEO**: Ensure `<html lang>`, `<link hreflang>`, and localized meta tags are set per locale
6. **Fallback**: English content as fallback when translation unavailable
