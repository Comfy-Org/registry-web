import { fn } from '@storybook/test'
import * as actual from './useFirebaseUser'

export * from './useFirebaseUser'
export const useFirebaseUser = fn(actual.useFirebaseUser).mockName(
    'useFirebaseUser'
)

console.log('mocking useFirebaseUser', useFirebaseUser)
