/**
 * Utility functions for managing admin JWT tokens in localStorage
 */

const ADMIN_JWT_STORAGE_KEY = 'admin_jwt_token'

interface AdminJwtTokenData {
  token: string
  expires_at: string
}

/**
 * Get the admin JWT token from localStorage
 * @returns The JWT token string, or null if not found or expired
 */
export function getAdminJwtToken(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(ADMIN_JWT_STORAGE_KEY)
    if (!stored) return null

    const data: AdminJwtTokenData = JSON.parse(stored)

    // Check if token is expired
    if (!isTokenValid(data.expires_at)) {
      clearAdminJwtToken()
      return null
    }

    return data.token
  } catch (error) {
    console.error('Error getting admin JWT token:', error)
    return null
  }
}

/**
 * Store the admin JWT token in localStorage
 * @param token The JWT token string
 * @param expiresAt ISO 8601 timestamp when the token expires
 */
export function setAdminJwtToken(token: string, expiresAt: string): void {
  if (typeof window === 'undefined') return

  try {
    const data: AdminJwtTokenData = {
      token,
      expires_at: expiresAt,
    }
    localStorage.setItem(ADMIN_JWT_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error setting admin JWT token:', error)
  }
}

/**
 * Check if the admin JWT token is valid (exists and not expired)
 * @returns true if token is valid, false otherwise
 */
export function isAdminJwtTokenValid(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const stored = localStorage.getItem(ADMIN_JWT_STORAGE_KEY)
    if (!stored) return false

    const data: AdminJwtTokenData = JSON.parse(stored)
    return isTokenValid(data.expires_at)
  } catch (error) {
    console.error('Error checking admin JWT token validity:', error)
    return false
  }
}

/**
 * Get the expiration timestamp of the stored token
 * @returns ISO 8601 timestamp, or null if no token exists
 */
export function getAdminJwtTokenExpiresAt(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(ADMIN_JWT_STORAGE_KEY)
    if (!stored) return null

    const data: AdminJwtTokenData = JSON.parse(stored)
    return data.expires_at
  } catch (error) {
    console.error('Error getting admin JWT token expiration:', error)
    return null
  }
}

/**
 * Remove the admin JWT token from localStorage
 */
export function clearAdminJwtToken(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(ADMIN_JWT_STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing admin JWT token:', error)
  }
}

/**
 * Check if a token expiration timestamp is still valid
 * @param expiresAt ISO 8601 timestamp
 * @returns true if token has not expired, false otherwise
 */
function isTokenValid(expiresAt: string): boolean {
  try {
    const expirationTime = new Date(expiresAt).getTime()
    const currentTime = Date.now()
    // Add 1 minute buffer to avoid using tokens that are about to expire
    return expirationTime > currentTime + 60 * 1000
  } catch (error) {
    console.error('Error parsing token expiration:', error)
    return false
  }
}
