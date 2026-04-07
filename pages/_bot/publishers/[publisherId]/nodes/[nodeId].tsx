import { GetStaticPaths, GetStaticProps } from 'next'
import { loadNodeStaticProps } from '@/src/hooks/i18n/nodeStaticProps'
import { TranslatedNodeContent } from '@/src/hooks/i18n/translateNode'
import NodeView from '../../../../publishers/[publisherId]/nodes/[nodeId]'

/**
 * Bot-only variant of /publishers/[publisherId]/nodes/[nodeId]. See
 * pages/_bot/nodes/[nodeId].tsx for the rationale.
 */
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
})

export const getStaticProps: GetStaticProps<{
  nodeId: string
  nodeName: string | null
  translatedContent: TranslatedNodeContent | null
}> = async ({ params, locale }) => {
  const nodeId = params?.nodeId as string
  const publisherId = params?.publisherId as string
  if (!nodeId || !publisherId) return { notFound: true }

  return loadNodeStaticProps({
    nodeId,
    publisherId,
    locale: locale ?? 'en',
    blocking: true,
  })
}

export default NodeView
