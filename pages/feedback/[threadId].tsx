import { Button, Spinner } from 'flowbite-react'
import { useRouter } from 'next/router'
import { z } from 'zod'
import withAuth from '@/components/common/HOC/withAuth'
import { FeedbackThread } from '@/components/feedback/FeedbackThread'
import { privateFeedbackEnabled } from '@/components/feedback/useVersionFeedback'
import { useGetUser } from '@/src/api/generated'
import {
  PRIVATE_REGISTRY_KEY,
  privateQueryOptions,
  isPrivateRegistryAccessDenied,
} from '@/src/api/privateRegistry'
import { useFirebaseUser } from '@/src/hooks/useFirebaseUser'
import { useNextTranslation } from '@/src/hooks/i18n'

const referenceSchema = z.object({
  threadId: z.string().uuid(),
  nodeId: z.string().min(1),
  versionId: z.string().uuid(),
  publisherId: z.string().min(1),
})

function FeedbackReferencePage() {
  const { t } = useNextTranslation()
  const router = useRouter()
  const [user] = useFirebaseUser()
  const reference = referenceSchema.safeParse(router.query)
  const identity = useGetUser({
    query: {
      ...privateQueryOptions,
      queryKey: [PRIVATE_REGISTRY_KEY, user?.uid, 'reference-user'],
      enabled: privateFeedbackEnabled && !!user && reference.success,
    },
  })
  if (!privateFeedbackEnabled)
    return (
      <p className="p-6 text-gray-200">
        {t('Private feedback is not enabled.')}
      </p>
    )
  if (!router.isReady) return <Spinner aria-label={t('Loading feedback')} />
  if (!reference.success)
    return (
      <p role="alert" className="p-6 text-gray-200">
        {t('This feedback reference is invalid.')}
      </p>
    )
  if (identity.isPending) return <Spinner aria-label={t('Loading feedback')} />
  if (isPrivateRegistryAccessDenied(identity.error) || !identity.data)
    return (
      <div role="alert" className="space-y-3 p-6 text-gray-200">
        <p>{t('Feedback is unavailable or you no longer have access.')}</p>
        <Button color="gray" onClick={() => void identity.refetch()}>
          {t('Try again')}
        </Button>
      </div>
    )
  return (
    <main className="mx-auto max-w-4xl space-y-4 p-6 text-gray-200">
      <h1 className="text-xl font-semibold">{t('Feedback reference')}</h1>
      <FeedbackThread
        {...reference.data}
        role={identity.data.isAdmin ? 'admin' : 'author'}
      />
    </main>
  )
}

export default withAuth(FeedbackReferencePage)
