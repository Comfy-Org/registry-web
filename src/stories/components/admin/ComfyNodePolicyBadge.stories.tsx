import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Badge } from 'flowbite-react'
import { ComfyNodePolicy } from '@/src/api/generated'

// Component that mimics the policy badge logic from the admin page
const ComfyNodePolicyBadge = ({ policy }: { policy?: ComfyNodePolicy }) => {
  const getPolicyBadgeColor = (policy: ComfyNodePolicy) => {
    switch (policy) {
      case ComfyNodePolicy.ComfyNodePolicyActive:
        return 'success'
      case ComfyNodePolicy.ComfyNodePolicyBanned:
        return 'failure'
      case ComfyNodePolicy.ComfyNodePolicyLocalOnly:
        return 'warning'
      default:
        return 'gray'
    }
  }

  const getPolicyLabel = (policy: ComfyNodePolicy) => {
    switch (policy) {
      case ComfyNodePolicy.ComfyNodePolicyActive:
        return 'Active'
      case ComfyNodePolicy.ComfyNodePolicyBanned:
        return 'Banned'
      case ComfyNodePolicy.ComfyNodePolicyLocalOnly:
        return 'Local Only'
      default:
        return 'Unknown'
    }
  }

  return (
    <Badge color={policy ? getPolicyBadgeColor(policy) : 'gray'} size="sm">
      {policy ? getPolicyLabel(policy) : 'No Policy'}
    </Badge>
  )
}

const meta: Meta<typeof ComfyNodePolicyBadge> = {
  title: 'Components/Admin/ComfyNodePolicyBadge',
  component: ComfyNodePolicyBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="dark bg-gray-900 p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ComfyNodePolicyBadge>

export const Active: Story = {
  args: {
    policy: ComfyNodePolicy.ComfyNodePolicyActive,
  },
}

export const Banned: Story = {
  args: {
    policy: ComfyNodePolicy.ComfyNodePolicyBanned,
  },
}

export const LocalOnly: Story = {
  args: {
    policy: ComfyNodePolicy.ComfyNodePolicyLocalOnly,
  },
}

export const NoPolicy: Story = {
  args: {
    policy: undefined,
  },
}

// Show all variants together
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <ComfyNodePolicyBadge policy={ComfyNodePolicy.ComfyNodePolicyActive} />
      <ComfyNodePolicyBadge policy={ComfyNodePolicy.ComfyNodePolicyBanned} />
      <ComfyNodePolicyBadge policy={ComfyNodePolicy.ComfyNodePolicyLocalOnly} />
      <ComfyNodePolicyBadge policy={undefined} />
    </div>
  ),
}
