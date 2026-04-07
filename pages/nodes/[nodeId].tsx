import { Breadcrumb } from 'flowbite-react'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { HiHome } from 'react-icons/hi'
import { useNextTranslation } from '@/src/hooks/i18n'
import { loadNodeStaticProps } from '@/src/hooks/i18n/nodeStaticProps'
import { TranslatedNodeContent } from '@/src/hooks/i18n/translateNode'
import NodeDetails from '../../components/nodes/NodeDetails'

// Pre-generate top nodes × top locales at build time for instant cache hits
// Only preheat on production builds, not preview PRs
const PREHEAT_LOCALES = ['zh', 'ja', 'ko', 'ru']
const PREHEAT_TOP_N = 20
const PREHEAT_ENABLED =
  process.env.VERCEL_ENV === 'production' ||
  process.env.VERCEL_GIT_COMMIT_REF === 'sno-i18n-isr'

export const getStaticPaths: GetStaticPaths = async () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  if (!backendUrl || !PREHEAT_ENABLED)
    return { paths: [], fallback: 'blocking' }

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

  // Human path: never blocks on OpenAI. Stored translations only; missing
  // locales are filled in client-side via /api/translate-node, so cold ISR
  // renders instantly. Bots are routed to /_bot/nodes/[nodeId] by middleware
  // for the blocking variant that guarantees translated meta tags in HTML.
  return loadNodeStaticProps({
    nodeId,
    locale: locale ?? 'en',
    blocking: false,
  })
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
