import { Button, Modal, Spinner } from 'flowbite-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useMutation } from '@tanstack/react-query'
import { useNextTranslation } from '@/src/hooks/i18n'
import { setAdminJwtToken } from '@/src/utils/adminJwtStorage'
import { customInstance } from '@/src/api/mutator/axios-instance'

// Stub implementation until backend API is updated
const useGenerateAdminToken = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await customInstance<{
        token: string
        expires_at: string
      }>({
        url: '/admin/generate-token',
        method: 'POST',
      })
      return response
    },
  })
}

export interface AdminJwtTokenModalProps {
  isOpen: boolean
  onClose: () => void
  onTokenGenerated?: () => void
}

export function AdminJwtTokenModal({
  isOpen,
  onClose,
  onTokenGenerated,
}: AdminJwtTokenModalProps) {
  const { t } = useNextTranslation()
  const [isGenerating, setIsGenerating] = useState(false)
  const generateTokenMutation = useGenerateAdminToken()

  const handleGenerateToken = async () => {
    setIsGenerating(true)
    try {
      const result = await generateTokenMutation.mutateAsync()

      // Store token in localStorage
      setAdminJwtToken(result.token, result.expires_at)

      // Show success message
      const expiresAt = new Date(result.expires_at).toLocaleString()
      toast.success(
        t('Admin JWT token generated successfully. Expires at: {{expiresAt}}', {
          expiresAt,
        })
      )

      // Notify parent component
      onTokenGenerated?.()

      // Close modal
      onClose()
    } catch (error) {
      console.error('Error generating admin JWT token:', error)
      toast.error(t('Failed to generate admin JWT token. Please try again.'))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Modal show={isOpen} onClose={onClose} size="md">
      <Modal.Header>{t('Generate Admin JWT Token')}</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t(
              'This operation requires an admin JWT token. The token will be valid for 1 hour and will be stored locally in your browser.'
            )}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('Click "Generate Token" to proceed with the admin operation.')}
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={handleGenerateToken}
          disabled={isGenerating}
          color="blue"
        >
          {isGenerating ? (
            <>
              <Spinner size="sm" className="mr-2" />
              {t('Generating...')}
            </>
          ) : (
            t('Generate Token')
          )}
        </Button>
        <Button color="gray" onClick={onClose} disabled={isGenerating}>
          {t('Cancel')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
