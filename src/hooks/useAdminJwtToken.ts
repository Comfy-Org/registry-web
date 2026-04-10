import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useGenerateAdminToken } from '@/src/api/generated'
import { useNextTranslation } from '@/src/hooks/i18n'
import {
  clearAdminJwtToken,
  getAdminJwtToken,
  getAdminJwtTokenExpiresAt,
  isAdminJwtTokenValid,
  setAdminJwtToken,
} from '@/src/utils/adminJwtStorage'

export interface UseAdminJwtTokenResult {
  token: string | null
  isValid: boolean
  expiresAt: string | null
  isGenerating: boolean
  generateToken: () => Promise<void>
  clearToken: () => void
  showTokenModal: boolean
  setShowTokenModal: (show: boolean) => void
}

/**
 * Hook for managing admin JWT tokens
 * Provides token state, generation, and validation
 */
export function useAdminJwtToken(): UseAdminJwtTokenResult {
  const { t } = useNextTranslation()
  const [token, setToken] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateTokenMutation = useGenerateAdminToken()

  // Load token from localStorage on mount
  useEffect(() => {
    refreshTokenState()
  }, [])

  const refreshTokenState = useCallback(() => {
    const currentToken = getAdminJwtToken()
    const valid = isAdminJwtTokenValid()
    const expires = getAdminJwtTokenExpiresAt()

    setToken(currentToken)
    setIsValid(valid)
    setExpiresAt(expires)
  }, [])

  const generateToken = useCallback(async () => {
    setIsGenerating(true)
    try {
      const result = await generateTokenMutation.mutateAsync()

      // Store token in localStorage
      setAdminJwtToken(result.token, result.expires_at)

      // Update state
      refreshTokenState()

      // Show success message
      const expiresAtFormatted = new Date(result.expires_at).toLocaleString()
      toast.success(
        t('Admin JWT token generated successfully. Expires at: {{expiresAt}}', {
          expiresAt: expiresAtFormatted,
        })
      )
    } catch (error) {
      console.error('Error generating admin JWT token:', error)
      toast.error(t('Failed to generate admin JWT token. Please try again.'))
      throw error
    } finally {
      setIsGenerating(false)
    }
  }, [generateTokenMutation, refreshTokenState, t])

  const clearToken = useCallback(() => {
    clearAdminJwtToken()
    refreshTokenState()
    toast.info(t('Admin JWT token cleared'))
  }, [refreshTokenState, t])

  return {
    token,
    isValid,
    expiresAt,
    isGenerating,
    generateToken,
    clearToken,
    showTokenModal,
    setShowTokenModal,
  }
}
