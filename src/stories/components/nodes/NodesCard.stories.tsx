import NodesCard from '@/components/nodes/NodesCard'
import { Node } from '@/src/api/generated'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { handlers } from '@/src/mocks/handlers'

const meta: Meta<typeof NodesCard> = {
    title: 'Components/Nodes/NodesCard',
    component: NodesCard,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
        msw: {
            handlers: handlers,
        },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NodesCard>

// Sample node data
const sampleNode: Node = {
    id: '1',
    name: 'Sample Node',
    description:
        'This is a sample node with a detailed description of what it does and how it can be used in your projects.',
    icon: 'https://via.placeholder.com/200',
    downloads: 1250,
    rating: 4.5,
}

export const Default: Story = {
    args: {
        node: sampleNode,
        buttonLink: '/nodes/1',
    },
}

export const WithoutIcon: Story = {
    args: {
        node: {
            ...sampleNode,
            icon: '',
        },
        buttonLink: '/nodes/1',
    },
}

export const LongDescription: Story = {
    args: {
        node: {
            ...sampleNode,
            description:
                'This is a very long description that will demonstrate how the component handles text overflow. It should truncate with an ellipsis after a certain point to maintain the card layout and prevent the UI from breaking with very long content. Users can click "More" to see the full description.',
        },
        buttonLink: '/nodes/1',
    },
}
