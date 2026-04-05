import { Breadcrumb } from 'flowbite-react'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'
import { HiHome } from 'react-icons/hi'
import NodeDetails from '@/components/nodes/NodeDetails'
import { useGetPublisher } from '@/src/api/generated'
import { useNextTranslation } from '@/src/hooks/i18n'
import {
  getTranslatedNodeContent,
  translateNodeContent,
  TranslatedNodeContent,
} from '@/src/hooks/i18n/translateNode'

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
})

export const getStaticProps: GetStaticProps<{
  translatedContent: TranslatedNodeContent | null
}> = async ({ params, locale }) => {
  const nodeId = params?.nodeId as string
  if (!nodeId) return { notFound: true }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    if (!backendUrl) {
      return { props: { translatedContent: null }, revalidate: 60 }
    }

    const res = await fetch(
      `${backendUrl}/nodes/${encodeURIComponent(nodeId)}?include_translations=true`
    )
    if (!res.ok) throw new Error(`API ${res.status}`)
    const node = await res.json()

    const extracted = getTranslatedNodeContent(node, locale ?? 'en')
    const translatedContent = await translateNodeContent(
      extracted,
      node.description,
      node.latest_version?.changelog
    )

    return {
      props: { translatedContent },
      revalidate: 3600,
    }
  } catch {
    return {
      props: { translatedContent: null },
      revalidate: 60,
    }
  }
}

const NodeView = ({
  translatedContent,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter()
  const { publisherId, nodeId } = router.query
  const { data: publisher } = useGetPublisher(publisherId as string)
  const { t } = useNextTranslation()

  return (
    <div className="p-4">
      <Breadcrumb className="py-4">
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
        <Breadcrumb.Item
          href={`/publishers/${publisherId}`}
          onClick={(e) => {
            e.preventDefault()
            router.push(`/publishers/${publisherId}`)
          }}
          className="dark"
        >
          {publisher?.name || publisherId}
        </Breadcrumb.Item>
        <Breadcrumb.Item className="text-blue-500">
          {nodeId as string}
        </Breadcrumb.Item>
      </Breadcrumb>

      <NodeDetails translatedContent={translatedContent} />
    </div>
  )
}

export default NodeView
