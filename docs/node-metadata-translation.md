# Node Metadata Dynamic Translation

## Problem Statement

The ComfyUI Registry displays custom nodes with metadata (descriptions, changelogs, etc.) that node authors write in various languages, primarily English. Users who speak other languages need to be able to read node descriptions and changelogs in their preferred language.

### Challenges

1. **User-Generated Content**: Node descriptions and changelogs are submitted by node authors, not part of the application's static content. Traditional i18n approaches that work with pre-translated static keys don't apply here.

2. **Dynamic and Unpredictable**: New nodes and versions are constantly added to the registry. We cannot pre-translate all possible content.

3. **Translation Quality**: We need accurate, contextual translations that preserve technical terminology specific to ComfyUI.

4. **Cost and Performance**: Server-side translation APIs (like Google Translate, OpenAI) can be expensive at scale and add latency.

5. **Availability**: Some translation services may not be accessible in certain regions (e.g., China).

## Solution: Browser-Based Dynamic Translation

This PR implements an experimental feature using Chrome's built-in Translator API to provide dynamic, on-demand translation of node metadata.

### How It Works

1. **Browser Translator API**: Uses Chrome 138+'s experimental `window.Translator` API, which provides local, on-device translation.

2. **Opt-in Feature**: Users can enable dynamic translation via a toggle in the language dropdown menu.

3. **Translation Hook**: The `useDynamicTranslate()` hook provides a `dt()` function that wraps i18next:
    - When disabled or unavailable: Returns the original text (English)
    - When enabled: Translates text on-demand using the browser's translation service

4. **Missing Key Handler**: When i18next encounters a missing translation key (user-generated content), it automatically attempts translation via the Translator API and caches the result.

5. **Selective Usage**: The `dt()` function is applied only to user-generated content:
    - Node descriptions (`dt(node.description)`)
    - Version changelogs (`dt(version.changelog)`)
    - Static UI text continues using regular `t()` function

### Implementation Details

#### Core Components

**`src/hooks/i18n/index.tsx`**

- TypeScript type definitions for Chrome's Translator API
- `useDynamicTranslateEnabled()` - LocalStorage-based toggle hook
- `useDynamicTranslate()` - Main hook providing:
    - `available` - Whether browser supports the Translator API
    - `enabled` - User preference for dynamic translation
    - `setEnabled` - Toggle function
    - `dt()` - Dynamic translation function
- `missingKeyHandler` - i18next callback that auto-translates missing keys

**`components/nodes/NodeDetails.tsx`**

- Uses `dt()` for node descriptions and version changelogs
- Displays English text when feature is disabled/unavailable

**`components/common/LanguageSwitcher.tsx`**

- Shows dynamic translation toggle when browser supports it
- Toggle appears as a checkbox option in the language dropdown
- Marked as "(Beta)" to indicate experimental status

### Advantages

1. **No Server Costs**: Translation happens locally in the browser
2. **Fast**: Local processing with no network round-trips
3. **Privacy**: Content never leaves the user's device
4. **Offline Capable**: Works without internet connection (after model download)
5. **Quality**: Uses Google's neural translation models
6. **Caching**: i18next automatically caches translated content

### Limitations

1. **Browser Support**: Only works in Chrome 138+ with experimental features enabled
2. **Not SSR-Compatible**: Cannot be used for server-side rendering
3. **Regional Availability**: Not available in all regions (notably China)
4. **Opt-in**: Users must manually enable the feature
5. **Initial Load**: First translation may be slower while browser downloads language models

### Dependencies

- `use-async@^1.2.0` - For managing async Translator API state
- `react-use` - For LocalStorage persistence of user preference

## Future Considerations

### Alternative Approaches

1. **OpenAI GPT Translation**: Server-side translation using ChatGPT API
    - Pros: Better quality, context-aware, available everywhere
    - Cons: API costs, latency, privacy concerns

2. **Crowdsourced Translations**: Allow community to submit translations
    - Pros: Free, potentially high quality for popular nodes
    - Cons: Requires moderation, incomplete coverage

3. **Publisher-Provided Translations**: Encourage node authors to provide translations
    - Pros: Most accurate, free
    - Cons: Low adoption, maintenance burden on publishers

### Potential Improvements

1. **Fallback to Server**: When browser API unavailable, use server-side translation
2. **Pre-translation**: Batch-translate popular nodes server-side
3. **Translation Memory**: Share translations across users via backend
4. **Quality Indicators**: Show confidence scores or allow users to report bad translations

## Testing

To test this feature:

1. Use Chrome 138+ with experimental features enabled
2. Visit a node detail page
3. Switch to a non-English language
4. Enable "Dynamic Translation" in the language dropdown
5. Observe descriptions and changelogs being translated

## References

- Chrome Translator API: [Built-in AI Early Preview Program](https://developer.chrome.com/docs/ai/built-in)
- i18next missing key handling: [i18next Events](https://www.i18next.com/overview/api#events)
