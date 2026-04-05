import { Breadcrumb } from 'flowbite-react'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { HiHome } from 'react-icons/hi'
import { useNextTranslation } from '@/src/hooks/i18n'
import {
  getTranslatedNodeContent,
  translateNodeContent,
  TranslatedNodeContent,
} from '@/src/hooks/i18n/translateNode'
import NodeDetails from '../../components/nodes/NodeDetails'

// Pre-generate top nodes × top locales at build time for instant cache hits
const PREHEAT_LOCALES = ['zh', 'ja', 'ko', 'ru']
const PREHEAT_TOP_N = 20

export const getStaticPaths: GetStaticPaths = async () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  if (!backendUrl) return { paths: [], fallback: 'blocking' }

  try {
    const res = await fetch(`${backendUrl}/nodes?limit=${PREHEAT_TOP_N}`)
    if (!res.ok) return { paths: [], fallback: 'blocking' }
    const data = await res.json()
    const nodes: { id?: string; downloads?: number }[] = data.nodes ?? []

    const topNodes = nodes
      .filter((n) => n.id && (n.downloads ?? 0) > 0)
      .sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
      .slice(0, PREHEAT_TOP_N)

    const paths = topNodes.flatMap((node) =>
      PREHEAT_LOCALES.map((locale) => ({
        params: { nodeId: node.id! },
        locale,
      }))
    )

    console.log(
      `[i18n-isr] Pre-generating ${paths.length} node pages (${topNodes.length} nodes × ${PREHEAT_LOCALES.length} locales)`
    )
    return { paths, fallback: 'blocking' }
  } catch {
    return { paths: [], fallback: 'blocking' }
  }
}

export const getStaticProps: GetStaticProps<{
  nodeId: string
  nodeName: string | null
  translatedContent: TranslatedNodeContent | null
}> = async ({ params, locale }) => {
  const nodeId = params?.nodeId as string
  if (!nodeId) return { notFound: true }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    if (!backendUrl) {
      return {
        props: { nodeId, nodeName: null, translatedContent: null },
        revalidate: 60,
      }
    }

    const res = await fetch(
      `${backendUrl}/nodes/${encodeURIComponent(nodeId)}?include_translations=true`
    )
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
    const node = await res.json()

    // Use stored translations if available, otherwise auto-translate via OpenAI.
    // The translation blocks ISR on first visit (~2-3s) but is cached for 1h after.
    // This ensures bots/SEO always see translated meta tags.
    const extracted = getTranslatedNodeContent(node, locale ?? 'en')
    const translatedContent = await translateNodeContent(
      extracted,
      node.description
    )

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

const NodeView = ({
  nodeName,
  translatedContent,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter()
  const { nodeId } = router.query
  const { t } = useNextTranslation()
  const title = nodeName
    ? `${nodeName} - ${t('ComfyUI Registry')}`
    : t('ComfyUI Registry')
  const description = translatedContent?.description ?? ''

  return (
    <div className="p-4">
      <Head>
        <title>{title}</title>
        {description && (
          <meta name="description" content={description.slice(0, 160)} />
        )}
        {description && (
          <meta property="og:description" content={description.slice(0, 160)} />
        )}
        {nodeName && <meta property="og:title" content={title} />}
      </Head>
      <div className="py-4">
        <Breadcrumb>
          <Breadcrumb.Item
            href="/"
            icon={HiHome}
            onClick={(e) => {
              e.preventDefault()
              router.push('/')
            }}
            className="dark"
          >
            {t('Home')}
          </Breadcrumb.Item>
          <Breadcrumb.Item className="dark">{t('All Nodes')}</Breadcrumb.Item>
          <Breadcrumb.Item className="dark text-blue-500">
            {nodeId as string}
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <NodeDetails translatedContent={translatedContent} />
    </div>
  )
}

export default NodeView
