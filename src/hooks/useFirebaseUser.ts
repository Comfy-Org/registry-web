import { getAuth } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'

/**
 * Custom hook that wraps useAuthState with Firebase auth instance
 * This allows for easier mocking in Storybook
 */
export const useFirebaseUser = () => {
    const auth = getAuth()
    return useAuthState(auth)
}
