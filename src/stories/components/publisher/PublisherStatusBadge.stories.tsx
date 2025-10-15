import { Meta, StoryObj } from '@storybook/nextjs-vite'
import PublisherStatusBadge from '@/components/publisher/PublisherStatusBadge'
import { PublisherStatus } from '@/src/api/generated'

const meta: Meta<typeof PublisherStatusBadge> = {
    title: 'Components/Publisher/PublisherStatusBadge',
    component: PublisherStatusBadge,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PublisherStatusBadge>

export const Banned: Story = {
    args: {
        status: PublisherStatus.PublisherStatusBanned,
    },
}

export const Active: Story = {
    args: {
        status: PublisherStatus.PublisherStatusActive,
    },
}

// No badge for Active status, so this will return null
export const NullState: Story = {
    args: {
        status: undefined,
    },
}
