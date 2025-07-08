import type { Meta, StoryObj } from '@storybook/react'
import ClaimMyNodeCompleteStageWaitingForCacheInvalidationTimer from './ClaimMyNodeCompleteStageWaitingForCacheInvalidationTimer'

const meta: Meta<
    typeof ClaimMyNodeCompleteStageWaitingForCacheInvalidationTimer
> = {
    title: 'Components/ClaimMyNodeCompleteStageWaitingForCacheInvalidationTimer',
    component: ClaimMyNodeCompleteStageWaitingForCacheInvalidationTimer,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'A countdown timer component that displays the remaining time for cache refresh after node ownership changes. This component is deprecated and will be removed when backend cache invalidation is properly handled.',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        completedAt: {
            description: 'The date when the node claim was completed',
            control: 'date',
        },
        cacheRefreshDurationMinutes: {
            description: 'Duration in minutes for cache refresh (default: 30)',
            control: { type: 'number', min: 1, max: 120, step: 1 },
        },
    },
}

export default meta
type Story = StoryObj<typeof meta>

// Story with timer just started (30 minutes remaining)
export const JustStarted: Story = {
    args: {
        completedAt: new Date(),
        cacheRefreshDurationMinutes: 30,
    },
}

// Story with timer halfway through (15 minutes remaining)
export const HalfwayThrough: Story = {
    args: {
        completedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        cacheRefreshDurationMinutes: 30,
    },
}

// Story with timer almost completed (1 minute remaining)
export const AlmostCompleted: Story = {
    args: {
        completedAt: new Date(Date.now() - 29 * 60 * 1000), // 29 minutes ago
        cacheRefreshDurationMinutes: 30,
    },
}

// Story with timer completed (cache refresh done)
export const Completed: Story = {
    args: {
        completedAt: new Date(Date.now() - 35 * 60 * 1000), // 35 minutes ago
        cacheRefreshDurationMinutes: 30,
    },
}

// Story with custom duration (10 minutes)
export const CustomDuration: Story = {
    args: {
        completedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        cacheRefreshDurationMinutes: 10,
    },
    parameters: {
        docs: {
            description: {
                story: 'Example with a custom cache refresh duration of 10 minutes.',
            },
        },
    },
}

// Story with very short duration for testing (1 minute)
export const ShortDuration: Story = {
    args: {
        completedAt: new Date(Date.now() - 30 * 1000), // 30 seconds ago
        cacheRefreshDurationMinutes: 1,
    },
    parameters: {
        docs: {
            description: {
                story: 'Example with a very short duration (1 minute) for testing purposes.',
            },
        },
    },
}
