import type { Meta, StoryObj } from '@storybook/react'
import NodeVersionStatusBadge from '../../../../components/nodes/NodeVersionStatusBadge'
import { NodeVersionStatus } from '@/src/api/generated'

const meta = {
    title: 'Components/Nodes/NodeVersionStatusBadge',
    component: NodeVersionStatusBadge,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        status: {
            control: 'select',
            options: Object.values(NodeVersionStatus),
            description: 'The status of the node version',
        },
    },
} satisfies Meta<typeof NodeVersionStatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Active: Story = {
    args: {
        status: NodeVersionStatus.NodeVersionStatusActive,
    },
}

export const Pending: Story = {
    args: {
        status: NodeVersionStatus.NodeVersionStatusPending,
    },
}

export const Flagged: Story = {
    args: {
        status: NodeVersionStatus.NodeVersionStatusFlagged,
    },
}

export const Banned: Story = {
    args: {
        status: NodeVersionStatus.NodeVersionStatusBanned,
    },
}

export const Undefined: Story = {
    args: {
        status: undefined,
    },
}