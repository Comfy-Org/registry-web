import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from 'flowbite-react'
import { useState } from 'react'
// Import the modal component directly from the page file
import { ComfyNodeEditModal } from '@/pages/admin/comfy-nodes'
import { ComfyNode, ComfyNodePolicy } from '@/src/api/generated'

// Mock ComfyNode data
const mockComfyNode: ComfyNode = {
  comfy_node_name: 'TestNode',
  category: 'Image Processing',
  description: 'A test node for image processing operations',
  function: 'process_image',
  input_types: 'IMAGE, CONDITIONING',
  return_names: 'image, mask',
  return_types: 'IMAGE, MASK',
  output_is_list: [false, true],
  deprecated: false,
  experimental: false,
  policy: ComfyNodePolicy.ComfyNodePolicyActive,
}

const mockDeprecatedNode: ComfyNode = {
  ...mockComfyNode,
  comfy_node_name: 'DeprecatedNode',
  category: 'Legacy',
  description: 'An old node that should not be used anymore',
  deprecated: true,
  policy: ComfyNodePolicy.ComfyNodePolicyBanned,
}

const mockExperimentalNode: ComfyNode = {
  ...mockComfyNode,
  comfy_node_name: 'ExperimentalNode',
  category: 'Research',
  description: 'An experimental node for testing new features',
  experimental: true,
  policy: ComfyNodePolicy.ComfyNodePolicyLocalOnly,
}

// Wrapper component to handle modal state
const ModalWrapper = ({
  comfyNode,
  nodeId = 'test-node',
  version = '1.0.0',
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Edit Modal</Button>
      <ComfyNodeEditModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        comfyNode={comfyNode}
        nodeId={nodeId}
        version={version}
        onSuccess={() => {
          console.log('Edit successful!')
          setIsOpen(false)
        }}
      />
    </div>
  )
}

const meta: Meta<typeof ModalWrapper> = {
  title: 'Components/Admin/ComfyNodeEditModal',
  component: ModalWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="dark min-h-screen bg-gray-900 p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ModalWrapper>

export const Default: Story = {
  args: {
    comfyNode: mockComfyNode,
    nodeId: 'test-node',
    version: '1.0.0',
  },
}

export const DeprecatedNode: Story = {
  args: {
    comfyNode: mockDeprecatedNode,
    nodeId: 'deprecated-node',
    version: '0.9.0',
  },
}

export const ExperimentalNode: Story = {
  args: {
    comfyNode: mockExperimentalNode,
    nodeId: 'experimental-node',
    version: '2.0.0-alpha',
  },
}

export const MinimalNode: Story = {
  args: {
    comfyNode: {
      comfy_node_name: 'MinimalNode',
      category: '',
      description: '',
      function: '',
      input_types: '',
      return_names: '',
      return_types: '',
      output_is_list: [],
      deprecated: false,
      experimental: false,
      policy: ComfyNodePolicy.ComfyNodePolicyActive,
    },
    nodeId: 'minimal-node',
    version: '1.0.0',
  },
}
