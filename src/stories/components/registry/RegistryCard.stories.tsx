import type { Meta, StoryObj } from '@storybook/react'
import RegistryCard from '../../../../components/registry/RegistryCard'
import { NodeVersion } from '@/src/api/generated'

const meta = {
    title: 'Components/Registry/RegistryCard',
    component: RegistryCard,
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
        name: {
            control: 'text',
            description: 'Name of the node',
        },
        id: {
            control: 'text',
            description: 'ID of the node',
        },
        publisherName: {
            control: 'text',
            description: 'Name of the publisher',
        },
        description: {
            control: 'text',
            description: 'Description of the node',
        },
        image: {
            control: 'text',
            description: 'Image URL for the node',
        },
        rating: {
            control: 'number',
            description: 'Rating of the node',
        },
        downloads: {
            control: 'number',
            description: 'Number of downloads',
        },
        license: {
            control: 'text',
            description: 'License type',
        },
        isLoggedIn: {
            control: 'boolean',
            description: 'Whether user is logged in',
        },
    },
} satisfies Meta<typeof RegistryCard>

export default meta
type Story = StoryObj<typeof meta>

const mockNodeVersion: NodeVersion = {
    id: '1',
    version: '1.0.0',
    changelog: 'Initial release',
    createdAt: '2023-01-01T00:00:00Z',
}

export const Default: Story = {
    args: {
        name: 'Sample Node',
        id: 'sample-node',
        latest_version: mockNodeVersion,
        license: 'MIT',
        publisherName: 'ComfyUI Developer',
        description: 'A sample node for demonstration purposes',
        image: 'https://via.placeholder.com/80x80',
        rating: 4.5,
        downloads: 1234,
        isLoggedIn: false,
    },
}

export const WithoutImage: Story = {
    args: {
        name: 'Text Only Node',
        id: 'text-only-node',
        latest_version: mockNodeVersion,
        license: 'Apache-2.0',
        publisherName: 'Another Developer',
        description: 'A node without an image',
        rating: 3.8,
        downloads: 567,
        isLoggedIn: true,
    },
}

export const HighRating: Story = {
    args: {
        name: 'Popular Node',
        id: 'popular-node',
        latest_version: mockNodeVersion,
        license: 'GPL-3.0',
        publisherName: 'Popular Developer',
        description: 'A highly rated node',
        image: 'https://via.placeholder.com/80x80/4CAF50/ffffff',
        rating: 4.9,
        downloads: 5678,
        isLoggedIn: true,
    },
}

export const LongName: Story = {
    args: {
        name: 'Super Long Node Name That Should Break Lines Properly',
        id: 'long-name-node',
        latest_version: mockNodeVersion,
        license: 'BSD-3-Clause',
        publisherName: 'Verbose Developer',
        description: 'A node with a very long name to test word wrapping',
        image: 'https://via.placeholder.com/80x80/FF9800/ffffff',
        rating: 4.2,
        downloads: 890,
        isLoggedIn: false,
    },
}

export const NoRating: Story = {
    args: {
        name: 'Unrated Node',
        id: 'unrated-node',
        latest_version: mockNodeVersion,
        license: 'MIT',
        publisherName: 'New Developer',
        description: 'A node without any rating',
        image: 'https://via.placeholder.com/80x80/9C27B0/ffffff',
        rating: 0,
        downloads: 12,
        isLoggedIn: false,
    },
}