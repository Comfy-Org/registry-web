import { getAuth } from 'firebase/auth'
import { useSyncExternalStore } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false
const initializing: ReturnType<typeof useAuthState> = [
  undefined,
  true,
  undefined,
]

/**
 * Custom hook that wraps useAuthState with Firebase auth instance
 * This allows for easier mocking in Storybook
 */
export const useFirebaseUser = () => {
  const auth = getAuth()
  const state = useAuthState(auth)
  // A restored browser session must not change the server's initial loading UI
  // during hydration. All auth consumers share this boundary.
  const hydrated = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot
  )
  return hydrated ? state : initializing
}
