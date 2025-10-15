import { Meta, StoryObj } from '@storybook/nextjs-vite'
import Hit from '@/components/Search/SearchHit'
import { UNCLAIMED_ADMIN_PUBLISHER_ID } from '@/src/constants'

// Note: The Snippet component from react-instantsearch is handled in the component
// For Storybook, we're providing the complete mock hit structure

// Create a wrapper component since Hit requires specific props structure
const HitWrapper = (props) => {
    // Mock the hit structure that would come from Algolia
    const mockHit = {
        id: props.id || '123',
        name: props.name || 'Node Name',
        description: props.description || 'This is a description of the node',
        publisher_id: props.publisherId || 'pub-123',
        total_install: props.totalInstall || 1500,
        latest_version: props.latestVersion || '1.2.3',
        comfy_nodes: props.comfyNodes || ['node1', 'node2'],
        // Add required Algolia Hit properties
        __position: 1,
        __queryID: 'sample-query-id',
        _highlightResult: {
            comfy_nodes: props.comfyNodes?.map((node) => ({
                value: node,
                matchedWords: props.matchedWords || ['node'],
            })),
        },
        _snippetResult: {
            description: {
                value: props.description || 'This is a description of the node',
            },
        },
        objectID: props.id || '123',
    }

    return <Hit hit={mockHit} />
}

const meta: Meta<typeof HitWrapper> = {
    title: 'Components/Search/SearchHit',
    component: HitWrapper,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof HitWrapper>

export const Default: Story = {
    args: {
        id: 'node-123',
        name: 'Image Upscaler',
        description: 'A node that upscales images using AI technology',
        publisherId: 'pub-456',
        totalInstall: 2500,
        latestVersion: '2.0.1',
        comfyNodes: ['upscaler', 'image-processor'],
        matchedWords: ['upscaler'],
    },
}

export const LongDescription: Story = {
    args: {
        id: 'node-456',
        name: 'Advanced Texture Generator',
        description:
            'This node generates procedural textures for 3D models with multiple parameters including roughness, metallic, and normal maps. It supports PBR workflows and can be integrated with various rendering engines.',
        publisherId: 'pub-789',
        totalInstall: 1800,
        latestVersion: '1.5.3',
        comfyNodes: ['texture', 'generator', 'procedural'],
        matchedWords: ['texture', 'generator'],
    },
}

export const UnclaimedNode: Story = {
    args: {
        id: 'node-789',
        name: 'Unclaimed Node',
        description:
            'This is an unclaimed node that can be claimed by a publisher',
        publisherId: UNCLAIMED_ADMIN_PUBLISHER_ID,
        totalInstall: 500,
        latestVersion: '0.9.0',
        comfyNodes: ['unclaimed'],
        matchedWords: ['unclaimed'],
    },
}
