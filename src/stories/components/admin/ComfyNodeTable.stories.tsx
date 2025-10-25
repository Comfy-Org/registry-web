import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Badge, Button, Table } from 'flowbite-react'
import { HiPencil } from 'react-icons/hi'
import { ComfyNode, ComfyNodePolicy } from '@/src/api/generated'

// Standalone table component for ComfyNodes
const ComfyNodeTable = ({
    comfyNodes,
    onEdit,
}: {
    comfyNodes: ComfyNode[]
    onEdit?: (comfyNode: ComfyNode) => void
}) => {
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
        <div className="overflow-x-auto">
            <Table>
                <Table.Head>
                    <Table.HeadCell>Name</Table.HeadCell>
                    <Table.HeadCell>Category</Table.HeadCell>
                    <Table.HeadCell>Function</Table.HeadCell>
                    <Table.HeadCell>Description</Table.HeadCell>
                    <Table.HeadCell>Policy</Table.HeadCell>
                    <Table.HeadCell>Flags</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                    {comfyNodes.map((comfyNode) => (
                        <Table.Row
                            key={comfyNode.comfy_node_name}
                            className="bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                {comfyNode.comfy_node_name}
                            </Table.Cell>
                            <Table.Cell>{comfyNode.category}</Table.Cell>
                            <Table.Cell>{comfyNode.function}</Table.Cell>
                            <Table.Cell>
                                <div className="max-w-xs truncate">
                                    {comfyNode.description}
                                </div>
                            </Table.Cell>
                            <Table.Cell>
                                <Badge
                                    color={
                                        comfyNode.policy
                                            ? getPolicyBadgeColor(
                                                  comfyNode.policy
                                              )
                                            : 'gray'
                                    }
                                    size="sm"
                                >
                                    {comfyNode.policy
                                        ? getPolicyLabel(comfyNode.policy)
                                        : 'No Policy'}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell>
                                <div className="flex gap-1">
                                    {comfyNode.deprecated && (
                                        <Badge color="warning" size="sm">
                                            Deprecated
                                        </Badge>
                                    )}
                                    {comfyNode.experimental && (
                                        <Badge color="info" size="sm">
                                            Experimental
                                        </Badge>
                                    )}
                                </div>
                            </Table.Cell>
                            <Table.Cell>
                                <Button
                                    size="sm"
                                    color="blue"
                                    onClick={() => onEdit?.(comfyNode)}
                                >
                                    <HiPencil className="mr-1" />
                                    Edit
                                </Button>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </div>
    )
}

// Mock data
const mockComfyNodes: ComfyNode[] = [
    {
        comfy_node_name: 'ImageProcessor',
        category: 'Image Processing',
        description:
            'Advanced image processing node with multiple filters and effects',
        function: 'process_image',
        input_types: 'IMAGE, CONDITIONING',
        return_names: 'image, mask',
        return_types: 'IMAGE, MASK',
        output_is_list: [false, true],
        deprecated: false,
        experimental: false,
        policy: ComfyNodePolicy.ComfyNodePolicyActive,
    },
    {
        comfy_node_name: 'TextGenerator',
        category: 'Text',
        description: 'Generate text using various AI models',
        function: 'generate_text',
        input_types: 'STRING, CONDITIONING',
        return_names: 'text',
        return_types: 'STRING',
        output_is_list: [false],
        deprecated: false,
        experimental: true,
        policy: ComfyNodePolicy.ComfyNodePolicyActive,
    },
    {
        comfy_node_name: 'LegacyFilter',
        category: 'Legacy',
        description: 'Old filter that should not be used anymore',
        function: 'apply_filter',
        input_types: 'IMAGE',
        return_names: 'filtered_image',
        return_types: 'IMAGE',
        output_is_list: [false],
        deprecated: true,
        experimental: false,
        policy: ComfyNodePolicy.ComfyNodePolicyBanned,
    },
    {
        comfy_node_name: 'LocalOnlyProcessor',
        category: 'Specialized',
        description: 'A processor that only works locally',
        function: 'local_process',
        input_types: 'ANY',
        return_names: 'result',
        return_types: 'ANY',
        output_is_list: [false],
        deprecated: false,
        experimental: false,
        policy: ComfyNodePolicy.ComfyNodePolicyLocalOnly,
    },
]

const meta: Meta<typeof ComfyNodeTable> = {
    title: 'Components/Admin/ComfyNodeTable',
    component: ComfyNodeTable,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div className="dark bg-gray-900 min-h-screen">
                <Story />
            </div>
        ),
    ],
}

export default meta
type Story = StoryObj<typeof ComfyNodeTable>

export const Default: Story = {
    args: {
        comfyNodes: mockComfyNodes,
        onEdit: (comfyNode) => {
            console.log('Edit clicked for:', comfyNode.comfy_node_name)
        },
    },
}

export const SingleNode: Story = {
    args: {
        comfyNodes: [mockComfyNodes[0]],
        onEdit: (comfyNode) => {
            console.log('Edit clicked for:', comfyNode.comfy_node_name)
        },
    },
}

export const EmptyTable: Story = {
    args: {
        comfyNodes: [],
        onEdit: (comfyNode) => {
            console.log('Edit clicked for:', comfyNode.comfy_node_name)
        },
    },
}

export const MixedPolicies: Story = {
    args: {
        comfyNodes: [
            {
                ...mockComfyNodes[0],
                policy: ComfyNodePolicy.ComfyNodePolicyActive,
            },
            {
                ...mockComfyNodes[1],
                policy: ComfyNodePolicy.ComfyNodePolicyBanned,
            },
            {
                ...mockComfyNodes[2],
                policy: ComfyNodePolicy.ComfyNodePolicyLocalOnly,
            },
            {
                ...mockComfyNodes[3],
                policy: undefined,
            },
        ],
        onEdit: (comfyNode) => {
            console.log('Edit clicked for:', comfyNode.comfy_node_name)
        },
    },
}
