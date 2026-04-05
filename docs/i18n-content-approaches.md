# Content i18n — Implementation Approaches Comparison

This document compares different approaches to automatically translate **dynamic content** (node descriptions, changelogs, publisher metadata) beyond the existing static UI text i18n.

## Current State

- **Static UI i18n**: ✅ Done — `t()` wraps all fixed strings, auto-translated via OpenAI in CI
- **Dynamic content**: 🚧 Node descriptions auto-translated at ISR time via OpenAI; changelogs still English-only
- **Backend API**: ✅ Already supports `node.translations` field (`NodeTranslations` type) and `POST /nodes/{nodeId}/translations` endpoint via `useCreateNodeTranslations` hook
- **9 languages** supported: en, zh, ja, fr, es, ko, ru, ar, tr

---

## Approach A: Server-side Translation at ISR/Build Time

**Translate content during `getStaticProps` with ISR revalidation.**

### How it works

1. `getStaticProps` fetches node data from API
2. If `node.translations[locale]` exists → use it
3. If not → call translation API (OpenAI / Google Translate) to translate `node.description` and `node.latest_version.changelog`
4. Cache translated content via ISR (`revalidate: 3600`)
5. Serve pre-rendered HTML per locale (SEO-friendly)

### Implementation sketch

```tsx
// pages/nodes/[nodeId].tsx
export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const node = await getNode(params.nodeId)

  // Use existing translations from API if available
  let description = node.translations?.[locale]?.description ?? node.description

  // Auto-translate if missing
  if (!node.translations?.[locale]?.description && locale !== 'en') {
    description = await translateText(node.description, locale)
    // Optionally persist back to API via createNodeTranslations
  }

  return { props: { node, description, locale }, revalidate: 3600 }
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // Generate on-demand
  fallback: 'blocking',
})
```

### Pros

| Pro                            | Detail                                                                    |
| ------------------------------ | ------------------------------------------------------------------------- |
| ✅ SEO-friendly                | Pre-rendered HTML in each locale, crawlable by search engines             |
| ✅ Fast page loads             | No client-side translation delay                                          |
| ✅ Works in all browsers       | No dependency on Chrome APIs                                              |
| ✅ Works in China              | No Chrome Translator API restriction                                      |
| ✅ ISR caching                 | Amortized translation cost, auto-refreshes                                |
| ✅ Backend already supports it | `node.translations` field + `POST /nodes/{nodeId}/translations` API exist |

### Cons

| Con                     | Detail                                                             |
| ----------------------- | ------------------------------------------------------------------ |
| ❌ Translation API cost | OpenAI/Google Translate costs per-character (mitigated by caching) |
| ❌ Build complexity     | Need ISR setup, error handling for translation API failures        |
| ❌ Stale translations   | ISR revalidation window means brief staleness                      |
| ❌ API key management   | Translation API key needed at build/ISR time                       |

### Effort estimate

- **Small-Medium** — `getStaticProps` + translation call + fallback logic. Backend API already exists.

---

## Approach B: Client-side Browser Translation (PR #198)

**Use Chrome's built-in Translator API to translate content in the browser.**

### How it works

1. Page loads with English content from API (CSR, as today)
2. `useDynamicTranslate` hook detects user's language preference
3. If user has opted-in + Chrome 138+ → translate content client-side
4. Toggle button (🌐/🔄) in language dropdown to enable/disable
5. Translations cached in browser

### Existing implementation

- PR #198: `useDynamicTranslate` hook in `src/hooks/i18n/index.tsx`
- Applied to `node.description` and `version.changelog` in NodeDetails

### Pros

| Pro                   | Detail                              |
| --------------------- | ----------------------------------- |
| ✅ Zero server cost   | Translation runs locally in browser |
| ✅ Works offline      | After initial model download        |
| ✅ No API keys needed | Uses browser's built-in capability  |
| ✅ Opt-in             | User controls whether to translate  |
| ✅ Already prototyped | PR #198 has working code            |

### Cons

| Con                       | Detail                                                     |
| ------------------------- | ---------------------------------------------------------- |
| ❌ Chrome 138+ only       | Firefox, Safari, older Chrome unsupported                  |
| ❌ Not available in China | Chrome Translator API restricted in some regions           |
| ❌ No SEO benefit         | Content rendered as English in HTML source                 |
| ❌ Flash of English       | User sees English briefly before translation completes     |
| ❌ Quality varies         | Browser ML model less accurate than GPT-4/Google Translate |
| ❌ Client-only            | SSR/SSG pages still serve English                          |

### Effort estimate

- **Small** — PR #198 already exists, needs review + merge.

---

## Approach C: Manual Translation Editor (PR #179)

**Admin/publisher UI for manually editing node translations, stored via backend API.**

### How it works

1. Publisher/admin visits `/nodes/[nodeId]/i18n`
2. Selects target language, edits fields (description, name, changelog)
3. Saves via `POST /nodes/{nodeId}/translations` API
4. Frontend reads `node.translations[locale]` to display translated content

### Existing implementation

- PR #179: Translation editor page with language selector, field management, Storybook stories

### Pros

| Pro                    | Detail                                                            |
| ---------------------- | ----------------------------------------------------------------- |
| ✅ Highest quality     | Human-reviewed translations                                       |
| ✅ Uses existing API   | `node.translations` + `createNodeTranslations` already in backend |
| ✅ Publisher ownership | Node authors can provide accurate translations                    |
| ✅ SEO-friendly        | If combined with SSR/ISR to render stored translations            |

### Cons

| Con                   | Detail                                                            |
| --------------------- | ----------------------------------------------------------------- |
| ❌ Manual effort      | Someone has to translate each node × each language                |
| ❌ Low coverage       | With 1000s of nodes × 9 languages, most will never get translated |
| ❌ Stale translations | When descriptions change, translations may not be updated         |
| ❌ Not automatic      | Requires active publisher participation                           |

### Effort estimate

- **Small-Medium** — PR #179 exists, needs backend API verification + review.

---

## Approach D: Hybrid — Auto-translate + Store + Serve via ISR

**Combine A + C: auto-translate missing content, allow manual overrides, serve via ISR.**

### How it works

1. **ISR build**: `getStaticProps` fetches node data
2. **Check stored translations**: Read `node.translations[locale]` from API
3. **Auto-translate missing**: If no stored translation, call OpenAI to translate, then `POST /nodes/{nodeId}/translations` to persist
4. **Manual override**: Publishers can edit via translation editor (PR #179)
5. **ISR refresh**: Revalidate periodically to pick up new/updated translations
6. **Browser fallback**: For unsupported locales, optionally use Chrome Translator (PR #198)

### Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ ISR/Build   │────▶│ Registry API │────▶│ node.translations│
│ getStaticPr │     │ GET /nodes/  │     │ (stored in DB)   │
│             │     └──────────────┘     └─────────────────┘
│             │            │                      ▲
│ if missing: │            │                      │
│ translate() │────────────┘               POST /nodes/{id}/
│ + persist   │──────────────────────────▶ translations
└─────────────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│ Pre-rendered │     │ Translation  │
│ HTML/locale  │     │ Editor UI    │
│ (SEO-ready)  │     │ (PR #179)    │
└─────────────┘     └──────────────┘
       │                    │
       ▼                    ▼
   End User            Publisher/Admin
   (any browser)       (manual override)
```

### Pros

| Pro                              | Detail                                                             |
| -------------------------------- | ------------------------------------------------------------------ |
| ✅ Full coverage                 | Auto-translate ensures every node has translations                 |
| ✅ High quality where it matters | Publishers can override auto-translations                          |
| ✅ SEO-friendly                  | Pre-rendered per locale                                            |
| ✅ Persisted                     | Translations stored in DB, not re-translated                       |
| ✅ Uses existing API             | `node.translations` + `createNodeTranslations`                     |
| ✅ Cost-efficient                | Translate once, cache forever (only retranslate on content change) |

### Cons

| Con                    | Detail                                          |
| ---------------------- | ----------------------------------------------- |
| ❌ Most complex        | Combines multiple systems                       |
| ❌ Initial cost        | First-time translation of all nodes × languages |
| ❌ Staleness detection | Need to detect when source description changes  |

### Effort estimate

- **Medium-Large** — ISR setup + translation API integration + persistence + editor UI.

---

## Comparison Matrix

| Criteria                     | A: ISR Server-side | B: Browser (PR#198) | C: Manual Editor (PR#179) |       D: Hybrid        |
| ---------------------------- | :----------------: | :-----------------: | :-----------------------: | :--------------------: |
| **SEO benefit**              |       ✅ Yes       |        ❌ No        |   ✅ If served via SSR    |         ✅ Yes         |
| **Coverage**                 |      ✅ Auto       |   ⚠️ Chrome-only    |         ❌ Manual         |    ✅ Auto + manual    |
| **Translation quality**      |  ⚠️ AI-generated   |    ⚠️ Browser ML    |         ✅ Human          | ✅ AI + human override |
| **Server cost**              | ⚠️ Translation API |       ✅ Zero       |          ✅ Zero          |   ⚠️ Translation API   |
| **Works in China**           |       ✅ Yes       |        ❌ No        |          ✅ Yes           |         ✅ Yes         |
| **Browser support**          |       ✅ All       |   ❌ Chrome 138+    |          ✅ All           |         ✅ All         |
| **Implementation effort**    |    Small-Medium    |  Small (PR exists)  | Small-Medium (PR exists)  |      Medium-Large      |
| **Requires backend changes** |  No (API exists)   |         No          |      No (API exists)      |    No (API exists)     |
| **Existing PR/code**         |        None        |       PR #198       |          PR #179          |     PR #198 + #179     |

---

## Recommendation

**Start with Approach A (ISR Server-side)**, then incrementally add C (Manual Editor) for publisher overrides.

### Rationale

1. **SEO is the primary driver** — Japanese/Chinese users searching for ComfyUI nodes need localized content in search results
2. **Backend API already exists** — `node.translations` field and `createNodeTranslations` endpoint are ready
3. **ISR is natural fit** — Node pages change infrequently, perfect for `revalidate: 3600`
4. **Translation cost is one-time** — Persist auto-translations via API, only retranslate on source change
5. **PR #198 (browser) can complement** as optional fallback for edge cases

### Suggested implementation order

1. **Phase 1**: Add `getStaticProps` + `getStaticPaths` to `pages/nodes/[nodeId].tsx` with ISR
2. **Phase 2**: Read `node.translations[locale]` in `getStaticProps` and pass as props
3. **Phase 3**: Add auto-translation for missing locales (OpenAI API in `getStaticProps`)
4. **Phase 4**: Persist auto-translations back to API via `createNodeTranslations`
5. **Phase 5**: Merge PR #179 (translation editor) for manual overrides
6. **Phase 6** (optional): Merge PR #198 (browser translation) as opt-in complement
