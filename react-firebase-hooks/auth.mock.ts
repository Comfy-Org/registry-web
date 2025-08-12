import { vi } from 'vitest'

// Mock the Firebase auth hooks for Storybook
export const useSignInWithGoogle = vi.fn().mockName('useSignInWithGoogle')
export const useSignInWithGithub = vi.fn().mockName('useSignInWithGithub')
export const useSignOut = vi.fn().mockName('useSignOut')
export const useAuthState = vi.fn().mockName('useAuthState')

// Set default return values
useSignInWithGoogle.mockReturnValue([vi.fn(), undefined, false, undefined])
useSignInWithGithub.mockReturnValue([vi.fn(), undefined, false, undefined])
useSignOut.mockReturnValue([vi.fn(), false, undefined])
useAuthState.mockReturnValue([null, false, undefined])

console.log('mocking react-firebase-hooks/auth', {
    useSignInWithGoogle,
    useSignInWithGithub,
    useSignOut,
    useAuthState,
})
