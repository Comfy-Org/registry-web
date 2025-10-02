import { vi } from 'vitest'
import { User as FirebaseUser } from 'firebase/auth'
import * as actual from './useFirebaseUser'
export * from './useFirebaseUser'

// Mock Firebase user data
export const mockFirebaseUser = {
    uid: 'firebase-user-123',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    photoURL: 'https://picsum.photos/40/40',
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => undefined,
    getIdToken: async () => '',
    getIdTokenResult: async () => ({}) as any,
    reload: async () => undefined,
    toJSON: () => ({}),
    phoneNumber: null,
    providerId: 'google',
} satisfies FirebaseUser // Using 'as any' to avoid having to mock the entire Firebase User interface

export const useFirebaseUser = vi
    .fn(actual.useFirebaseUser)
    .mockName('useFirebaseUser')
    .mockReturnValue([mockFirebaseUser, false, undefined])
