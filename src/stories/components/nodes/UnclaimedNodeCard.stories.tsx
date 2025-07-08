import type { Meta, StoryObj } from '@storybook/react'
import UnclaimedNodeCard from '../../../../components/nodes/UnclaimedNodeCard'
import { Node } from '@/src/api/generated'

const meta = {
    title: 'Components/Nodes/UnclaimedNodeCard',
    component: UnclaimedNodeCard,
    parameters: {
        layout: 'centered',
        backgrounds: {
            default: 'dark',
            values: [
                { name: 'dark', value: '#1f2937' },
                { name: 'light', value: '#ffffff' },
            ],
        },
    },
    tags: ['autodocs'],
    argTypes: {
        node: {
            control: 'object',
            description: 'The node object',
        },
        onSuccess: {
            action: 'success-callback',
            description: 'Callback function called on success',
        },
    },
} satisfies Meta<typeof UnclaimedNodeCard>

export default meta
type Story = StoryObj<typeof meta>

const mockNode: Node = {
    id: 'unclaimed-node-1',
    name: 'Unclaimed Node Example',
    description: 'This is an unclaimed node that can be claimed by publishers. It includes a detailed description to showcase how the component handles longer text content.',
    icon: 'https://via.placeholder.com/200x200/4CAF50/ffffff',
    rating: 4.2,
    publisher: {
        id: 'publisher-123',
        name: 'GitHub Publisher',
    },
    latest_version: {
        id: 'version-1',
        version: '1.0.0',
        changelog: 'Initial release',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
}

export const Default: Story = {
    args: {
        node: mockNode,
        onSuccess: () => console.log('Claim successful'),
    },
}

export const WithoutIcon: Story = {
    args: {
        node: {
            ...mockNode,
            icon: undefined,
        },
        onSuccess: () => console.log('Claim successful'),
    },
}

export const LongDescription: Story = {
    args: {
        node: {
            ...mockNode,
            description: 'This is a very long description that should test the text wrapping and ellipsis functionality. It contains multiple sentences and should demonstrate how the component handles overflow text content. The description continues with even more text to really test the limits of the component layout.',
        },
        onSuccess: () => console.log('Claim successful'),
    },
}

export const ShortName: Story = {
    args: {
        node: {
            ...mockNode,
            name: 'Short',
            description: 'A node with a short name',
        },
        onSuccess: () => console.log('Claim successful'),
    },
}

export const LongName: Story = {
    args: {
        node: {
            ...mockNode,
            name: 'A Very Long Node Name That Should Test Word Wrapping',
            description: 'A node with a very long name to test layout',
        },
        onSuccess: () => console.log('Claim successful'),
    },
}