import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fn } from '@storybook/test'
import { http, HttpResponse } from 'msw'
import { Node, Publisher, User } from '@/src/api/generated'
import { User as FirebaseUser } from 'firebase/auth'
import ClaimMyNodePage from '@/pages/publishers/[publisherId]/claim-my-node'
import { UNCLAIMED_ADMIN_PUBLISHER_ID } from '@/src/constants'
import { CAPI } from '@/src/mocks/apibase'
import { useFirebaseUser } from '@/src/hooks/useFirebaseUser.mock'

// Mock next/router
const mockRouter = {
    pathname: '/publishers/[publisherId]/claim-my-node',
    route: '/publishers/[publisherId]/claim-my-node',
    query: {
        publisherId: 'publisher-1',
        nodeId: 'sample-node-1',
    },
    asPath: '/publishers/publisher-1/claim-my-node?nodeId=sample-node-1',
    push: fn(),
    replace: fn(),
    reload: fn(),
    back: fn(),
    prefetch: fn(),
    beforePopState: fn(),
    events: {
        on: fn(),
        off: fn(),
        emit: fn(),
    },
    isFallback: false,
    isLocaleDomain: false,
    isPreview: false,
    isReady: true,
    defaultLocale: 'en',
    domainLocales: [],
    locales: ['en'],
    locale: 'en',
    basePath: '',
}

// Sample data
const sampleNode: Node = {
    id: 'sample-node-1',
    name: 'Sample Custom Node',
    description: 'A sample ComfyUI custom node for testing purposes',
    icon: 'https://via.placeholder.com/200',
    downloads: 1250,
    rating: 4.5,
    repository: 'https://github.com/sample-user/sample-comfy-node',
    publisher: {
        id: UNCLAIMED_ADMIN_PUBLISHER_ID,
        name: 'Unclaimed Admin',
    },
}

const samplePublisher: Publisher = {
    id: 'publisher-1',
    name: 'My Publisher',
    description: 'My primary publisher account',
}

const sampleUser: User = {
    id: 'user-1',
    name: 'Sample User',
    email: 'user@example.com',
}

// Mock Firebase user data
const mockFirebaseUser = {
    uid: 'firebase-user-123',
    email: 'user@example.com',
    displayName: 'Sample User',
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

// MSW handlers for different scenarios
const createHandlers = (
    scenario: 'default' | 'loading' | 'without-repository' | 'already-claimed'
) => {
    const baseHandlers = [
        // User endpoint
        http.get(CAPI('/users'), () => {
            return HttpResponse.json(sampleUser)
        }),

        // Publisher endpoint
        http.get(CAPI('/publishers/publisher-1'), () => {
            return HttpResponse.json(samplePublisher)
        }),

        // Claim node endpoint
        http.post(
            CAPI('/publishers/publisher-1/nodes/sample-node-1/claim-my-node'),
            () => {
                return HttpResponse.json({ success: true })
            }
        ),
    ]

    // Node endpoint - varies by scenario
    const nodeHandler = (() => {
        switch (scenario) {
            case 'loading':
                return http.get(CAPI('/nodes/sample-node-1'), () => {
                    return new Promise(() => {}) // Never resolves to simulate loading
                })
            case 'without-repository':
                return http.get(CAPI('/nodes/sample-node-1'), () => {
                    return HttpResponse.json({
                        ...sampleNode,
                        repository: undefined,
                    })
                })
            case 'already-claimed':
                return http.get(CAPI('/nodes/sample-node-1'), () => {
                    return HttpResponse.json({
                        ...sampleNode,
                        publisher: {
                            id: 'existing-publisher',
                            name: 'Existing Publisher',
                        },
                    })
                })
            default:
                return http.get(CAPI('/nodes/sample-node-1'), () => {
                    return HttpResponse.json(sampleNode)
                })
        }
    })()

    return [nodeHandler, ...baseHandlers]
}

const meta: Meta<typeof ClaimMyNodePage> = {
    title: 'Pages/ClaimMyNodePage',
    component: ClaimMyNodePage,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
        nextjs: {
            router: mockRouter,
        },
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => {
            const queryClient = new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: false,
                        staleTime: 0,
                    },
                },
            })

            return (
                <QueryClientProvider client={queryClient}>
                    <Story />
                </QueryClientProvider>
            )
        },
    ],
}

export default meta
type Story = StoryObj<typeof ClaimMyNodePage>

export const InitialStage: Story = {
    parameters: {
        msw: {
            handlers: createHandlers('default'),
        },
    },
    beforeEach: () => {
        // Mock Firebase user as logged in
        useFirebaseUser.mockReturnValue([mockFirebaseUser, false, undefined])
    },
}

export const Loading: Story = {
    parameters: {
        msw: {
            handlers: createHandlers('loading'),
        },
    },
    beforeEach: () => {
        // Mock Firebase user as logged in
        useFirebaseUser.mockReturnValue([mockFirebaseUser, false, undefined])
    },
}

export const WithoutRepository: Story = {
    parameters: {
        msw: {
            handlers: createHandlers('without-repository'),
        },
    },
    beforeEach: () => {
        // Mock Firebase user as logged in
        useFirebaseUser.mockReturnValue([mockFirebaseUser, false, undefined])
    },
}

export const AlreadyClaimed: Story = {
    parameters: {
        msw: {
            handlers: createHandlers('already-claimed'),
        },
    },
    beforeEach: () => {
        // Mock Firebase user as logged in
        useFirebaseUser.mockReturnValue([mockFirebaseUser, false, undefined])
    },
}

export const NotLoggedIn: Story = {
    parameters: {
        msw: {
            handlers: createHandlers('default'),
        },
    },
    beforeEach: () => {
        // Mock Firebase user as not logged in
        useFirebaseUser.mockReturnValue([null, false, undefined])
    },
}
