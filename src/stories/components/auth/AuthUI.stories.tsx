import AuthUI from '@/components/AuthUI/AuthUI'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CAPI, handlers } from '@/src/mocks/handlers'
import { http, HttpResponse } from 'msw'
import { User } from '@/src/api/generated'
import { User as FirebaseUser } from 'firebase/auth'
import { useFirebaseUser } from '@/src/hooks/useFirebaseUser.mock'
import { 
    useSignInWithGoogle, 
    useSignInWithGithub 
} from 'react-firebase-hooks/auth'
import { fn } from '@storybook/test'

const meta: Meta<typeof AuthUI> = {
    title: 'Components/Auth/SignIn',
    component: AuthUI,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
        msw: {
            handlers: handlers,
        },
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div className="bg-gray-900 min-h-screen">
                <Story />
            </div>
        ),
    ],
}

export default meta
type Story = StoryObj<typeof AuthUI>

// Mock user data
const mockUser: User = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    isAdmin: false,
    isApproved: true,
}

// Mock Firebase user data
const mockFirebaseUser = {
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
} satisfies FirebaseUser

export const Default: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/users'), () => 
                    HttpResponse.json(null, { status: 401 })
                ),
                ...handlers,
            ],
        },
    },
    beforeEach: () => {
        // Mock Firebase user as logged out
        useFirebaseUser.mockReturnValue([null, false, undefined])
        
        // Mock Firebase auth hooks
        useSignInWithGoogle.mockReturnValue([fn(), undefined, false, undefined])
        useSignInWithGithub.mockReturnValue([fn(), undefined, false, undefined])
    },
}

export const Loading: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/users'), () => 
                    HttpResponse.json(null, { status: 401 })
                ),
                ...handlers,
            ],
        },
    },
    beforeEach: () => {
        // Mock Firebase user as loading
        useFirebaseUser.mockReturnValue([null, true, undefined])
        
        // Mock Firebase auth hooks with Google loading state
        useSignInWithGoogle.mockReturnValue([fn(), undefined, true, undefined])
        useSignInWithGithub.mockReturnValue([fn(), undefined, false, undefined])
    },
}

export const GoogleError: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/users'), () => 
                    HttpResponse.json(null, { status: 401 })
                ),
                ...handlers,
            ],
        },
    },
    beforeEach: () => {
        // Mock Firebase user as logged out
        useFirebaseUser.mockReturnValue([null, false, undefined])
        
        // Mock Firebase auth hooks with Google error
        const googleError = {
            code: 'auth/account-exists-with-different-credential',
            message: 'Account already exists with different credential'
        }
        useSignInWithGoogle.mockReturnValue([fn(), undefined, false, googleError])
        useSignInWithGithub.mockReturnValue([fn(), undefined, false, undefined])
    },
}

export const GitHubError: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/users'), () => 
                    HttpResponse.json(null, { status: 401 })
                ),
                ...handlers,
            ],
        },
    },
    beforeEach: () => {
        // Mock Firebase user as logged out
        useFirebaseUser.mockReturnValue([null, false, undefined])
        
        // Mock Firebase auth hooks with GitHub error
        const githubError = {
            code: 'auth/network-request-failed',
            message: 'Network error. Please try again.'
        }
        useSignInWithGoogle.mockReturnValue([fn(), undefined, false, undefined])
        useSignInWithGithub.mockReturnValue([fn(), undefined, false, githubError])
    },
}

export const AlreadyLoggedIn: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/users'), () => HttpResponse.json(mockUser)),
                ...handlers,
            ],
        },
    },
    beforeEach: () => {
        // Mock Firebase user as logged in (component should redirect)
        useFirebaseUser.mockReturnValue([mockFirebaseUser, false, undefined])
        
        // Mock Firebase auth hooks
        useSignInWithGoogle.mockReturnValue([fn(), undefined, false, undefined])
        useSignInWithGithub.mockReturnValue([fn(), undefined, false, undefined])
    },
}
