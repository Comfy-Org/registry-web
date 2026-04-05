import type { Node } from '@/src/api/generated'

export interface TranslatedNodeContent {
  description?: string
  changelog?: string
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
