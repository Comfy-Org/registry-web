import { Breadcrumb } from 'flowbite-react'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'
import { HiHome } from 'react-icons/hi'
import { useNextTranslation } from '@/src/hooks/i18n'
import {
  getTranslatedNodeContent,
  translateNodeContent,
  TranslatedNodeContent,
} from '@/src/hooks/i18n/translateNode'
import NodeDetails from '../../components/nodes/NodeDetails'

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
})

export const getStaticProps: GetStaticProps<{
  nodeId: string
  translatedContent: TranslatedNodeContent | null
}> = async ({ params, locale }) => {
  const nodeId = params?.nodeId as string
  if (!nodeId) return { notFound: true }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    if (!backendUrl) {
      return { props: { nodeId, translatedContent: null }, revalidate: 60 }
    }

    const res = await fetch(
      `${backendUrl}/nodes/${encodeURIComponent(nodeId)}?include_translations=true`
    )
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
    const node = await res.json()

    const extracted = getTranslatedNodeContent(node, locale ?? 'en')
    const translatedContent = await translateNodeContent(
      extracted,
      node.description,
      node.latest_version?.changelog
    )

    return {
      props: { nodeId, translatedContent },
      revalidate: 3600,
    }
  } catch {
    return {
      props: { nodeId, translatedContent: null },
      revalidate: 60,
    }
  }
}

const NodeView = ({
  translatedContent,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter()
  const { nodeId } = router.query
  const { t } = useNextTranslation()

  return (
    <div className="p-4">
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
