# i18n ISR Implementation — Experience & Results

## What we built

Server-side content translation for node detail pages using Next.js ISR (Incremental Static Regeneration) + OpenAI gpt-4o-mini auto-translation.

**PR**: [#257](https://github.com/Comfy-Org/registry-web/pull/257)
**Branch**: `sno-i18n-isr`

---

## Architecture

```
Build time (production only):
  getStaticPaths → fetch top 20 nodes by downloads from API
                 → generate paths for zh, ja, ko, ru locales (80 pages)

Per page (getStaticProps):
  1. Fetch node data with include_translations=true
  2. Check node.translations[locale] for stored translations
  3. If no stored translation → call OpenAI gpt-4o-mini to translate
  4. Return translated content as props (pre-rendered in HTML)
  5. Cache via ISR (revalidate: 3600s success, 60s on failure)

Human path (default):
  Stored translations only; missing translations remain in English
  until stored upstream. No client-side OpenAI calls.

Bot path (middleware-routed to /_bot/nodes/[nodeId]):
  Blocks on OpenAI translation to guarantee translated meta tags in HTML.
```

---

## Performance Results

### TTFB (Time To First Byte)

| Scenario                                | TTFB           | Cache Status              |
| --------------------------------------- | -------------- | ------------------------- |
| **Preheated page (top 20 × 4 locales)** | **~500-800ms** | HIT from deploy           |
| **ISR cache HIT**                       | **~90ms**      | HIT (after first visit)   |
| **ISR cold MISS (with translation)**    | **~2-4s**      | MISS (first visitor only) |
| **ISR cold MISS (no OPENAI_API_KEY)**   | **~1.3s**      | MISS (English fallback)   |

### Page sizes

| Locale | Size     |
| ------ | -------- |
| /en/   | ~10.8 KB |
| /ja/   | ~11.0 KB |
| /ru/   | ~11.2 KB |
| /zh/   | ~10.8 KB |
| /ko/   | ~10.9 KB |

### Preheat matrix

- **Top 20 nodes × 4 locales = 80 pages** preheated at build time
- Only runs on production (`VERCEL_ENV === 'production'`)
- Build time impact: ~1 min (parallel, 80 pages)
- OpenAI cost: ~$0.01

---

## Key Decisions & Tradeoffs

### 1. Blocking translation in getStaticProps (not async)

**Decision**: OpenAI translation runs in `getStaticProps`, blocking the first visitor for ~2-3s.

**Why**: SEO requires translated content in the HTML source (`<meta description>`, `og:description`). Async client-side translation doesn't help bots — they don't execute JavaScript reliably for meta tags.

**Tradeoff**: First visitor to an uncached locale+node waits 2-3s. All subsequent visitors get ~90ms from cache.

### 2. Preheat top N × top M (not all nodes)

**Decision**: Pre-generate only the top 20 nodes by downloads × 4 top locales (zh, ja, ko, ru) = 80 pages.

**Why**: 4000 nodes × 8 locales = 32,000 pages would take too long and waste API credits. Download data shows a steep long tail — top 20 nodes cover ~94% of downloads.

**Tradeoff**: Unpopular nodes still get 2-3s cold miss on first visit, but they have near-zero traffic anyway.

### 3. Native fetch instead of generated axios client

**Decision**: Use `fetch()` directly in `getStaticProps` instead of the generated `getNode()` hook.

**Why**: The generated axios client relies on interceptors set up in `_app.tsx` (browser environment). In `getStaticProps` (server-side), the interceptors aren't available. Direct `fetch()` is simpler and more reliable for server-side data fetching.

### 4. No client-side translation fallback

**Decision**: Removed the `/api/translate-node` route and client-side `useEffect` translation. Human visitors see stored translations or English; bots are routed by middleware to `/_bot/nodes/[nodeId]` which blocks on OpenAI.

**Why**: Client-side translation couldn't populate `<meta>` tags for SEO, and added complexity. The bot path guarantees translated HTML for crawlers, while human visitors get instant page loads with stored translations.

### 5. Production-only preheat

**Decision**: Preheat only when `VERCEL_ENV === 'production'` (+ test branch).

**Why**: Preview PR deploys don't need preheated pages. Skipping preheat saves build time and OpenAI credits on the ~10+ preview deploys per day.

---

## Debugging Lessons

### 1. `translatedContent: null` — API call failing on Vercel

**Symptom**: ISR page returned `translatedContent: null` despite API working locally.

**Root cause**: The generated axios client (`customInstance`) didn't work in `getStaticProps` because the axios interceptors from `_app.tsx` aren't loaded server-side.

**Fix**: Switch to native `fetch()` with `process.env.NEXT_PUBLIC_BACKEND_URL`.

### 2. OPENAI_API_KEY expired on Vercel

**Symptom**: Translation never fired despite code working locally.

**Root cause**: Vercel had two `OPENAI_API_KEY` entries — a 317-day-old expired key scoped to "Preview" and a new valid key scoped only to "staging" branch.

**Fix**: Updated the Preview-scoped key. Used `vercel env ls` and `vercel env pull` to diagnose.

**Lesson**: Always check env var scoping on Vercel — branch-scoped vars can shadow global ones.

### 3. Stale ISR cache after code changes

**Symptom**: After pushing new code with translation, the page still showed English.

**Root cause**: ISR cache from the previous deployment (with `translatedContent: null`) was being served. The `revalidate: 60` was set on the error path, but the STALE page was still served while revalidating.

**Fix**: Wait for ISR revalidation cycle, or trigger a fresh deploy.

### 4. `shallow: true` breaking locale switch

**Symptom**: Switching from Japanese to Russian showed Japanese translation.

**Root cause**: `useNextTranslation().changeLanguage()` used `router.replace(..., { shallow: true })`, which skips `getStaticProps` re-execution.

**Fix**: Remove `shallow: true` from locale change navigation.

### 5. prbot github-issue search misreporting merged PRs

**Symptom**: PR #171 (Arabic language support) reported as "closed" instead of "merged".

**Root cause**: (a) GitHub API `state` field doesn't distinguish merged from closed. (b) `prbot` searches across all Comfy-Org repos, returning unrelated issues with the same number.

**Fix**: Reported via `prbot feedback`. Cross-reference with actual GitHub PR page.

---

## Files Changed

| File                                                | Purpose                                        |
| --------------------------------------------------- | ---------------------------------------------- |
| `pages/nodes/[nodeId].tsx`                          | ISR + preheat + SEO meta tags                  |
| `pages/publishers/[publisherId]/nodes/[nodeId].tsx` | ISR + publisher validation                     |
| `pages/_bot/nodes/[nodeId].tsx`                     | Bot path: blocking OpenAI translation for SEO  |
| `components/nodes/NodeDetails.tsx`                  | Accept translated props                        |
| `src/hooks/i18n/translateNode.ts`                   | Translation extraction + OpenAI auto-translate |
| `src/hooks/i18n/index.ts`                           | Remove `shallow: true` for locale switch       |
| `src/constants.ts`                                  | Export `LANGUAGE_NAMES`                        |

---

## Follow-up Issues

- **#258**: Server-to-server auth for persisting auto-translations to DB
  - Without this, every ISR revalidation re-translates via OpenAI
  - With this, translate once → store in `node.translations` → ISR reads from DB
- **PR #179**: Manual translation editor UI (publishers can override auto-translations)
- **PR #198**: Chrome browser-based translation (optional complement)
