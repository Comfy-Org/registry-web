import React from 'react'
import { act } from 'react-dom/test-utils'
import { hydrateRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import type { User } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { useFirebaseUser } from '../../src/hooks/useFirebaseUser'

// Mock only the SDK boundary. The hook and React hydration run unchanged.
vi.mock('firebase/auth', () => ({ getAuth: vi.fn(() => ({})) }))
vi.mock('react-firebase-hooks/auth', () => ({ useAuthState: vi.fn() }))

function Account() {
  const [user, loading, error] = useFirebaseUser()
  return (
    <p>{loading ? 'Loading' : (error?.message ?? user?.uid ?? 'Signed out')}</p>
  )
}

let root: Root | undefined
let host: HTMLDivElement
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  host = document.createElement('div')
  document.body.append(host)
})
afterEach(async () => {
  if (root) await act(async () => root!.unmount())
  root = undefined
  host.remove()
  vi.unstubAllGlobals()
  vi.resetAllMocks()
})

test.each([
  { name: 'restored owner', user: { uid: 'owner' } as User, expected: 'owner' },
  { name: 'signed-out visitor', user: null, expected: 'Signed out' },
])(
  'hydrates $name without replacing server markup, then follows identity changes',
  async ({ user, expected }) => {
    vi.mocked(useAuthState).mockReturnValue([undefined, true, undefined])
    host.innerHTML = renderToString(<Account />)
    const serverMarkup = host.firstChild
    expect(host.textContent).toBe('Loading')

    // Firebase may finish restoring the session before hydrateRoot starts.
    vi.mocked(useAuthState).mockReturnValue([user, false, undefined])
    const onRecoverableError = vi.fn()
    await act(async () => {
      root = hydrateRoot(host, <Account />, { onRecoverableError })
    })
    expect(host.textContent).toBe(expected)
    expect(host.firstChild).toBe(serverMarkup)
    expect(onRecoverableError).not.toHaveBeenCalled()

    for (const next of [null, { uid: 'another-owner' } as User]) {
      vi.mocked(useAuthState).mockReturnValue([next, false, undefined])
      await act(async () => root!.render(<Account />))
      expect(host.textContent).toBe(next?.uid ?? 'Signed out')
    }
    vi.mocked(useAuthState).mockReturnValue([
      undefined,
      false,
      new Error('Session unavailable'),
    ])
    await act(async () => root!.render(<Account />))
    expect(host.textContent).toBe('Session unavailable')
  }
)
