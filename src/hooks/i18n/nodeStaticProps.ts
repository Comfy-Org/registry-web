import type { GetStaticPropsResult } from 'next'
import {
  getTranslatedNodeContent,
  translateNodeContent,
  TranslatedNodeContent,
} from './translateNode'

export interface NodeStaticPropsData {
  nodeId: string
  nodeName: string | null
  translatedContent: TranslatedNodeContent | null
}

/**
 * Shared loader for node detail page getStaticProps.
 *
 * - `blocking: false` (human path) — only uses stored translations from the
 *   registry API, never calls OpenAI. Cold ISR rendering is instant; missing
 *   translations are filled in client-side via /api/translate-node.
 * - `blocking: true` (bot path) — additionally awaits an OpenAI translation
 *   when no stored translation exists, so search engine crawlers always see
 *   localized meta tags in the HTML source.
 */
export async function loadNodeStaticProps({
  nodeId,
  locale,
  publisherId,
  blocking,
}: {
  nodeId: string
  locale: string
  publisherId?: string
  blocking: boolean
}): Promise<GetStaticPropsResult<NodeStaticPropsData>> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  if (!backendUrl) {
    return {
      props: { nodeId, nodeName: null, translatedContent: null },
      revalidate: 60,
    }
  }

  try {
    const res = await fetch(
      `${backendUrl}/nodes/${encodeURIComponent(nodeId)}?include_translations=true`
    )
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
    const node = await res.json()

    // Validate publisher in URL matches the node's actual publisher
    if (
      publisherId &&
      node.publisher?.id &&
      node.publisher.id !== publisherId
    ) {
      return {
        redirect: {
          destination: `/publishers/${encodeURIComponent(node.publisher.id)}/nodes/${encodeURIComponent(nodeId)}`,
          permanent: false,
        },
      }
    }

    const extracted = getTranslatedNodeContent(node, locale)
    const translatedContent = blocking
      ? await translateNodeContent(extracted, node.description)
      : extracted

    return {
      props: {
        nodeId,
        nodeName: node.name ?? null,
        translatedContent,
      },
      revalidate: 3600,
    }
  } catch {
    return {
      props: { nodeId, nodeName: null, translatedContent: null },
      revalidate: 60,
    }
  }
}
