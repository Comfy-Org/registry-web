import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { User as FirebaseUser } from 'firebase/auth'
import { HttpResponse, http } from 'msw'
import ClaimNodePage from '@/pages/nodes/[nodeId]/claim'
import { Node, Publisher } from '@/src/api/generated'
import { UNCLAIMED_ADMIN_PUBLISHER_ID } from '@/src/constants'
import { useFirebaseUser } from '@/src/hooks/useFirebaseUser.mock'

const meta: Meta<typeof ClaimNodePage> = {
    title: 'Pages/ClaimNodePage',
    component: ClaimNodePage,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
        nextjs: {
            appDirectory: false,
            navigation: {
                pathname: '/nodes/sample-node-1/claim',
                query: { nodeId: 'sample-node-1' },
                push: () => {},
                replace: () => {},
                back: () => {},
            },
            router: {
                pathname: '/nodes/[nodeId]/claim',
                route: '/nodes/[nodeId]/claim',
                query: { nodeId: 'sample-node-1' },
                asPath: '/nodes/sample-node-1/claim',
                push: () => Promise.resolve(true),
                replace: () => Promise.resolve(true),
                reload: () => {},
                back: () => {},
                prefetch: () => Promise.resolve(),
                beforePopState: () => {},
                events: {
                    on: () => {},
                    off: () => {},
                    emit: () => {},
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
            },
        },
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => {
            const queryClient = new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: false,
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
type Story = StoryObj<typeof ClaimNodePage>

// Sample data
const sampleUnclaimedNode: Node = {
    id: 'sample-node-1',
    name: 'Sample Custom Node',
    description: 'A sample ComfyUI custom node for testing purposes',
    icon: 'https://via.placeholder.com/200',
    downloads: 1250,
    repository: 'https://github.com/sample-user/sample-comfy-node',
    publisher: {
        id: UNCLAIMED_ADMIN_PUBLISHER_ID,
        name: 'Unclaimed Admin',
    },
}

const sampleClaimedNode: Node = {
    ...sampleUnclaimedNode,
    id: 'claimed-node-1',
    name: 'Already Claimed Node',
    publisher: {
        id: 'existing-publisher',
        name: 'Existing Publisher',
    },
}

const sampleNodeWithoutRepository: Node = {
    ...sampleUnclaimedNode,
    repository: undefined,
}

const samplePublishers: Publisher[] = [
    {
        id: 'publisher-1',
        name: 'My First Publisher',
        description: 'My primary publisher account',
    },
    {
        id: 'publisher-2',
        name: 'Secondary Publisher',
        description: 'Alternative publisher account',
    },
]

// Mock Firebase user data
const mockFirebaseUser = {
    uid: 'firebase-user-123',
    email: 'user@example.com',
    displayName: 'Test User',
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

export const WithPublishers: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get('*/nodes/sample-node-1', () => {
                    return HttpResponse.json(sampleUnclaimedNode)
                }),
                http.get('*/users/publishers', () => {
                    return HttpResponse.json(samplePublishers)
                }),
            ],
        },
    },
    beforeEach: () => {
        // Mock Firebase user as logged in
        useFirebaseUser.mockReturnValue([mockFirebaseUser, false, undefined])
    },
}

export const WithoutPublishers: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get('*/nodes/sample-node-1', () => {
                    return HttpResponse.json(sampleUnclaimedNode)
                }),
                http.get('*/users/publishers', () => {
                    return HttpResponse.json([])
                }),
            ],
        },
    },
    beforeEach: () => {
        // Mock Firebase user as logged in but no publishers
        useFirebaseUser.mockReturnValue([mockFirebaseUser, false, undefined])
    },
}

export const AlreadyClaimed: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get('*/nodes/sample-node-1', () => {
                    return HttpResponse.json(sampleClaimedNode)
                }),
                http.get('*/users/publishers', () => {
                    return HttpResponse.json(samplePublishers)
                }),
            ],
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
            handlers: [
                http.get('*/nodes/sample-node-1', () => {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve(HttpResponse.json(sampleUnclaimedNode))
                        }, 2000)
                    })
                }),
                http.get('*/users/publishers', () => {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve(HttpResponse.json(samplePublishers))
                        }, 1500)
                    })
                }),
            ],
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
            handlers: [
                http.get('*/nodes/sample-node-1', () => {
                    return HttpResponse.json(sampleNodeWithoutRepository)
                }),
                http.get('*/users/publishers', () => {
                    return HttpResponse.json(samplePublishers)
                }),
            ],
        },
    },
    beforeEach: () => {
        // Mock Firebase user as logged in
        useFirebaseUser.mockReturnValue([mockFirebaseUser, false, undefined])
    },
}

export const NodeError: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get('*/nodes/sample-node-1', () => {
                    return HttpResponse.json(
                        { error: 'Node not found' },
                        { status: 404 }
                    )
                }),
                http.get('*/users/publishers', () => {
                    return HttpResponse.json(samplePublishers)
                }),
            ],
        },
    },
    beforeEach: () => {
        // Mock Firebase user as logged in
        useFirebaseUser.mockReturnValue([mockFirebaseUser, false, undefined])
    },
}

export const PublishersError: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get('*/nodes/sample-node-1', () => {
                    return HttpResponse.json(sampleUnclaimedNode)
                }),
                http.get('*/users/publishers', () => {
                    return HttpResponse.json(
                        { error: 'Failed to load publishers' },
                        { status: 500 }
                    )
                }),
            ],
        },
    },
    beforeEach: () => {
        // Mock Firebase user as logged in
        useFirebaseUser.mockReturnValue([mockFirebaseUser, false, undefined])
    },
}

export const SinglePublisher: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get('*/nodes/sample-node-1', () => {
                    return HttpResponse.json(sampleUnclaimedNode)
                }),
                http.get('*/users/publishers', () => {
                    return HttpResponse.json([samplePublishers[0]])
                }),
            ],
        },
    },
    beforeEach: () => {
        // Mock Firebase user as logged in
        useFirebaseUser.mockReturnValue([mockFirebaseUser, false, undefined])
    },
}

export const LoggedOut: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get('*/nodes/sample-node-1', () => {
                    return HttpResponse.json(sampleUnclaimedNode)
                }),
                http.get('*/users/publishers', () => {
                    return HttpResponse.json(
                        { error: 'Unauthorized' },
                        { status: 401 }
                    )
                }),
            ],
        },
    },
    beforeEach: () => {
        // Mock Firebase user as logged out
        useFirebaseUser.mockReturnValue([null, false, undefined])
    },
}
