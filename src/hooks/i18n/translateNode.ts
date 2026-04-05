import type { Node } from '@/src/api/generated'
import { LANGUAGE_NAMES } from '@/src/constants'

export interface TranslatedNodeContent {
  description?: string
  locale: string
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
    }
  }

  const translation = node.translations?.[locale] as
    | { description?: unknown }
    | undefined

  const translatedDesc = translation?.description

  return {
    locale,
    description:
      typeof translatedDesc === 'string' && translatedDesc
        ? translatedDesc
        : node.description,
  }
}

/**
 * Auto-translate missing content using OpenAI API (server-side only, used in getStaticProps).
 * Returns translated content, or the original if translation fails or API key is missing.
 */
export async function translateNodeContent(
  content: TranslatedNodeContent,
  sourceDescription?: string
): Promise<TranslatedNodeContent> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || content.locale === 'en') return content

  // Only translate if we're still showing the English fallback
  const needsDescTranslation =
    content.description && content.description === sourceDescription

  if (!needsDescTranslation) return content

  const langName = LANGUAGE_NAMES[content.locale] ?? content.locale

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)

  try {
    const prompt = `[description]\n${content.description}`

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
      signal: controller.signal,
    })

    if (!res.ok) return content

    const data = await res.json()
    const reply: string = data.choices?.[0]?.message?.content ?? ''

    const regex = /\[description\]\r?\n([\s\S]*?)$/
    const match = reply.match(regex)
    if (match?.[1]?.trim()) {
      return { ...content, description: match[1].trim() }
    }
    return content
  } catch {
    return content
  } finally {
    clearTimeout(timeout)
  }
}
