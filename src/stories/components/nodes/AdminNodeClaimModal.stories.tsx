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

// Create mock data for the component
// Note: In Storybook, we can't directly mock modules like we do with jest.
// Instead, we'll use MSW (Mock Service Worker) or pass props directly
// For this component, we'll need to set up MSW handlers in the stories

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
