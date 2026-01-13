import { Breadcrumb, Button, Card, Spinner } from 'flowbite-react'
import { HiHome, HiCheck, HiX, HiClock } from 'react-icons/hi'
import withAdmin from '@/components/common/HOC/authAdmin'
import { useNextTranslation } from '@/src/hooks/i18n'
import { useAdminJwtToken } from '@/src/hooks/useAdminJwtToken'
import { AdminJwtTokenModal } from '@/components/admin/AdminJwtTokenModal'

function AdminJwtPage() {
  const { t } = useNextTranslation()
  const {
    token,
    isValid,
    expiresAt,
    isGenerating,
    generateToken,
    clearToken,
    showTokenModal,
    setShowTokenModal,
  } = useAdminJwtToken()

  const formatExpiresAt = (expiresAt: string | null) => {
    if (!expiresAt) return t('N/A')
    try {
      return new Date(expiresAt).toLocaleString()
    } catch {
      return t('Invalid date')
    }
  }

  const getTokenStatus = () => {
    if (!token) {
      return {
        label: t('No Token'),
        color: 'text-gray-500 dark:text-gray-400',
        icon: HiClock,
        description: t(
          'No admin JWT token found. Generate one to perform admin operations.'
        ),
      }
    }
    if (isValid) {
      return {
        label: t('Valid'),
        color: 'text-green-600 dark:text-green-400',
        icon: HiCheck,
        description: t('Token is valid and can be used for admin operations.'),
      }
    }
    return {
      label: t('Expired'),
      color: 'text-red-600 dark:text-red-400',
      icon: HiX,
      description: t('Token has expired. Generate a new one to continue.'),
    }
  }

  const status = getTokenStatus()
  const StatusIcon = status.icon

  return (
    <div>
      <Breadcrumb className="py-4 px-4">
        <Breadcrumb.Item href="/" icon={HiHome}>
          {t('Home')}
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/admin">{t('Admin Dashboard')}</Breadcrumb.Item>
        <Breadcrumb.Item>{t('JWT Token Management')}</Breadcrumb.Item>
      </Breadcrumb>

      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-200 mb-6">
          {t('Admin JWT Token Management')}
        </h1>

        <div className="space-y-6">
          {/* Token Status Card */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">{t('Token Status')}</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <StatusIcon className={`h-6 w-6 ${status.color}`} />
                <span className={`text-lg font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {status.description}
              </p>
              {expiresAt && (
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('Expires at:')}{' '}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatExpiresAt(expiresAt)}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Token Management Card */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">
              {t('Token Management')}
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t(
                  'Admin JWT tokens are required for certain administrative operations like banning/unbanning nodes. Tokens are valid for 1 hour.'
                )}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowTokenModal(true)}
                  color="blue"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      {t('Generating...')}
                    </>
                  ) : (
                    t('Generate New Token')
                  )}
                </Button>
                {token && (
                  <Button onClick={clearToken} color="gray">
                    {t('Clear Token')}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Information Card */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">{t('Information')}</h2>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                {t(
                  '• JWT tokens are stored locally in your browser and are not sent to the server except during admin operations.'
                )}
              </p>
              <p>
                {t(
                  '• Tokens expire after 1 hour. You will be prompted to generate a new token when needed.'
                )}
              </p>
              <p>
                {t(
                  '• Only users with admin privileges can generate JWT tokens.'
                )}
              </p>
              <p>
                {t(
                  '• If you encounter issues, try clearing your token and generating a new one.'
                )}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Token Generation Modal */}
      <AdminJwtTokenModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onTokenGenerated={() => {
          // Token state will be automatically updated by the hook
        }}
      />
    </div>
  )
}

export default withAdmin(AdminJwtPage)
