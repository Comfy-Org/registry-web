import { vi } from 'vitest'
import * as actual from './useFirebaseUser'
export * from './useFirebaseUser'
export const useFirebaseUser = vi
    .fn(actual.useFirebaseUser)
    .mockName('useFirebaseUser')

console.log('mocking useFirebaseUser', useFirebaseUser)
