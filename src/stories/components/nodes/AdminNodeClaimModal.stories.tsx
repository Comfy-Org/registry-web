import { AdminNodeClaimModal } from '@/components/nodes/AdminNodeClaimModal'
import { Node, Publisher } from '@/src/api/generated'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Mock function for actions

const meta: Meta<typeof AdminNodeClaimModal> = {
    title: 'Components/Nodes/AdminNodeClaimModal',
    component: AdminNodeClaimModal,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
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
type Story = StoryObj<typeof AdminNodeClaimModal>

// Sample node data
const sampleNode: Node = {
    id: 'sample-node-1',
    name: 'Sample Custom Node',
    description: 'A sample ComfyUI custom node for testing purposes',
    icon: 'https://via.placeholder.com/200',
    downloads: 1250,
    rating: 4.5,
    repository: 'https://github.com/sample-user/sample-comfy-node',
    publisher: {
        id: 'unclaimed-admin',
        name: 'Unclaimed Admin',
    },
}

// Sample publishers data
const samplePublishers: Publisher[] = [
    {
        id: 'publisher-1',
        name: 'ComfyUI Publisher',
        description: 'Official ComfyUI publisher',
    },
    {
        id: 'publisher-2',
        name: 'Community Publisher',
        description: 'Community-driven publisher',
    },
    {
        id: 'long-publisher-name',
        name: 'Very Long Publisher Name That Should Be Handled Properly',
        description: 'Testing long names',
    },
]

// Mock the API hooks
const mockUseListPublishers = () => ({
    data: samplePublishers,
    isLoading: false,
    error: null,
})

const mockUseUpdateNode = () => ({
    mutateAsync: () => Promise.resolve(),
    isPending: false,
    error: null,
})

// Mock the API imports
jest.mock('@/src/api/generated', () => ({
    ...jest.requireActual('@/src/api/generated'),
    useListPublishers: () => mockUseListPublishers(),
    useUpdateNode: () => mockUseUpdateNode(),
}))

export const Default: Story = {
    args: {
        isOpen: true,
        onClose: () => {},
        node: sampleNode,
        onSuccess: () => {},
    },
}

export const WithLongNodeName: Story = {
    args: {
        isOpen: true,
        onClose: () => {},
        node: {
            ...sampleNode,
            name: 'Very Long Node Name That Should Be Handled Properly In The Modal',
            id: 'very-long-node-id-that-should-also-be-handled-properly',
        },
        onSuccess: () => {},
    },
}

export const WithoutRepository: Story = {
    args: {
        isOpen: true,
        onClose: () => {},
        node: {
            ...sampleNode,
            repository: undefined,
        },
        onSuccess: () => {},
    },
}

export const LoadingPublishers: Story = {
    args: {
        isOpen: true,
        onClose: () => {},
        node: sampleNode,
        onSuccess: () => {},
    },
    parameters: {
        msw: {
            handlers: [
                // Mock loading state
            ],
        },
    },
}

export const Closed: Story = {
    args: {
        isOpen: false,
        onClose: () => {},
        node: sampleNode,
        onSuccess: () => {},
    },
}
