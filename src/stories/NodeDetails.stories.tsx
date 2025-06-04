import NodeDetails from '@/components/nodes/NodeDetails'
import { NodeStatus, NodeVersion, NodeVersionStatus, PublisherStatus } from '@/src/api/generated'
import { Meta, StoryObj } from '@storybook/react'
import { QueryClient } from '@tanstack/react-query'
import { WithQueryClientProvider } from './components/WithQueryClientProvider'

// Mock the Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    query: { nodeId: 'node-123' },
    push: jest.fn(),
    pathname: '/nodes/[nodeId]',
  }),
}))

// Mock for useGetNode hook
const mockNode = {
  id: 'node-123',
  name: 'Example ComfyUI Node',
  description: 'This is an example node for ComfyUI with various features and capabilities.',
  icon: '',
  downloads: 12500,
  status: NodeStatus.NodeStatusActive,
  publisher: {
    id: 'publisher-123',
    name: 'Example Publisher',
    status: PublisherStatus.PublisherStatusActive,
  },
  repository: 'https://github.com/example/comfy-node',
  search_ranking: 3,
  preempted_comfy_node_names: ['ComfyNode1', 'ExampleNode2'],
}

// Mock for useListNodeVersions hook
const mockNodeVersions: NodeVersion[] = [
  {
    id: 'version-1',
    node_id: 'node-123',
    version: '1.2.3',
    changelog: 'Example changelog for the latest version',
    createdAt: new Date().toISOString(),
    status: NodeVersionStatus.NodeVersionStatusActive,
    downloadUrl: 'https://example.com/download/node-123.zip',
  },
  {
    id: 'version-2',
    node_id: 'node-123',
    version: '1.1.0',
    changelog: 'Previous version changelog',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: NodeVersionStatus.NodeVersionStatusActive,
    downloadUrl: 'https://example.com/download/node-123-1.1.0.zip',
  }
]

// Mock for useGetUser hook
const mockUser = {
  uid: 'user-123',
  email: 'example@example.com',
  display_name: 'Example User',
  photoURL: '',
  is_admin: false,
}

// Mock for useGetPermissionOnPublisherNodes hook
const mockPermission = {
  can_create_node: true,
  can_update_node: true,
  can_delete_node: true,
}

// Create a wrapper component that sets up all the mocks
const NodeDetailsWithMocks = ({ 
  isLoading = false, 
  isAdmin = false,
  showPreemptedNames = true
}) => {
  // Create a new query client for each story to prevent shared state
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  })

  // Set up mocks before rendering
  if (!isLoading) {
    // Set up node data
    queryClient.setQueryData(['getNode', 'node-123'], {
      ...mockNode,
      preempted_comfy_node_names: showPreemptedNames ? mockNode.preempted_comfy_node_names : [],
    })

    // Set up node versions
    queryClient.setQueryData(['listNodeVersions', 'node-123'], mockNodeVersions)

    // Set up user data with admin status if needed
    queryClient.setQueryData(['/users'], {
      ...mockUser,
      is_admin: isAdmin,
    })

    // Set up permissions
    queryClient.setQueryData(['getPermissionOnPublisherNodes', 'publisher-123'], mockPermission)
  }

  return (
    <WithQueryClientProvider client={queryClient}>
      <div className="bg-gray-900 min-h-screen">
        <NodeDetails />
      </div>
    </WithQueryClientProvider>
  )
}

const meta = {
  title: 'Pages/NodeDetails',
  component: NodeDetailsWithMocks,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NodeDetailsWithMocks>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Loading: Story = {
  args: {
    isLoading: true,
  },
}

export const AdminView: Story = {
  args: {
    isAdmin: true,
  },
}

export const AdminViewNoPreemptedNames: Story = {
  args: {
    isAdmin: true,
    showPreemptedNames: false,
  },
}
