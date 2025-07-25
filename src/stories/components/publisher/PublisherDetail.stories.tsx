import PublisherDetail from '@/components/publisher/PublisherDetail'
import { Publisher, PublisherStatus } from '@/src/api/generated'
import { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof PublisherDetail> = {
    title: 'Components/Publisher/PublisherDetail',
    component: PublisherDetail,
    parameters: {
        layout: 'fullscreen',
        backgrounds: {
            default: 'dark',
            values: [{ name: 'dark', value: '#111827' }],
        },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PublisherDetail>

const mockPublisher: Publisher = {
    id: 'test-publisher',
    name: 'Test Publisher',
    status: PublisherStatus.PublisherStatusActive,
    members: [
        {
            user: {
                name: 'Test User',
                email: 'test@example.com',
            },
            role: 'owner',
        },
    ],
}

export const Default: Story = {
    args: {
        publisher: mockPublisher,
    },
    parameters: {
        docs: {
            description: {
                story: 'The PublisherDetail component with the new publish instruction banner before the API Keys section.',
            },
        },
    },
}
