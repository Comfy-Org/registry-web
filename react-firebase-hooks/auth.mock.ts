import { fn } from '@storybook/test'

// Mock the Firebase auth hooks for Storybook
export const useSignInWithGoogle = fn().mockName('useSignInWithGoogle')
export const useSignInWithGithub = fn().mockName('useSignInWithGithub')
export const useSignOut = fn().mockName('useSignOut')

// Set default return values
useSignInWithGoogle.mockReturnValue([fn(), undefined, false, undefined])
useSignInWithGithub.mockReturnValue([fn(), undefined, false, undefined])
useSignOut.mockReturnValue([fn(), false, undefined])

console.log('mocking react-firebase-hooks/auth', {
    useSignInWithGoogle,
    useSignInWithGithub,
    useSignOut,
})