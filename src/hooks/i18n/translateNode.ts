import type { Node } from '@/src/api/generated'

export interface TranslatedNodeContent {
  description?: string
  changelog?: string
  locale: string
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
  fr: 'Français',
  es: 'Español',
  ko: '한국어',
  ru: 'Русский',
  ar: 'العربية',
  tr: 'Türkçe',
}

/**
 * Extract translated content for a node in the given locale.
 * Falls back to the original English content if no translation is available.
 */
export function getTranslatedNodeContent(
  node: Node,
  locale: string
): TranslatedNodeContent {
  if (locale === 'en') {
    return {
      locale,
      description: node.description,
      changelog: node.latest_version?.changelog,
    }
  }

  const translation = node.translations?.[locale] as
    | { description?: string; changelog?: string }
    | undefined

  return {
    locale,
    description: (translation?.description as string) || node.description,
    changelog:
      (translation?.changelog as string) || node.latest_version?.changelog,
  }
}

/**
 * Auto-translate missing content using OpenAI API (server-side only, used in getStaticProps).
 * Returns translated content, or the original if translation fails or API key is missing.
 */
export async function translateNodeContent(
  content: TranslatedNodeContent,
  sourceDescription?: string,
  sourceChangelog?: string
): Promise<TranslatedNodeContent> {
  const apiKey = process.env.OPENAI_API_KEY
  console.log('[i18n-isr] translateNodeContent:', {
    locale: content.locale,
    hasApiKey: !!apiKey,
    descMatch: content.description === sourceDescription,
    changelogMatch: content.changelog === sourceChangelog,
  })
  if (!apiKey || content.locale === 'en') return content

  // Only translate if we're still showing the English fallback
  const needsDescTranslation =
    content.description && content.description === sourceDescription
  const needsChangelogTranslation =
    content.changelog && content.changelog === sourceChangelog

  if (!needsDescTranslation && !needsChangelogTranslation) return content

  const langName = LANGUAGE_NAMES[content.locale] ?? content.locale

  try {
    const parts: { key: string; text: string }[] = []
    if (needsDescTranslation)
      parts.push({ key: 'description', text: content.description! })
    if (needsChangelogTranslation)
      parts.push({ key: 'changelog', text: content.changelog! })

    const prompt = parts.map((t) => `[${t.key}]\n${t.text}`).join('\n\n')

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Translate the following ComfyUI custom node metadata into ${langName} (${content.locale}). Preserve technical terms, node names, and code references. Return the translation in the same [key] format. No explanation needed.`,
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      }),
    })

    if (!res.ok) return content

    const data = await res.json()
    const reply: string = data.choices?.[0]?.message?.content ?? ''

    const result = { ...content }
    for (const { key } of parts) {
      const regex = new RegExp(`\\[${key}\\]\\n([\\s\\S]*?)(?=\\n\\[|$)`)
      const match = reply.match(regex)
      if (match?.[1]?.trim()) {
        ;(result as Record<string, string>)[key] = match[1].trim()
      }
    }
    return result
  } catch {
    return content
  }
}
