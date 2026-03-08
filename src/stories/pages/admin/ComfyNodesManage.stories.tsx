import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import ComfyNodesManage from '@/pages/admin/comfy-nodes'
import {
  ComfyNode,
  ComfyNodePolicy,
  useListAllComfyNodes,
} from '@/src/api/generated'

// Mock router
const mockRouter = {
  push: () => {},
  pathname: '/admin/comfy-nodes',
  query: {},
  asPath: '/admin/comfy-nodes',
  back: () => {},
  beforePopState: () => {},
  prefetch: () => {},
  reload: () => {},
  replace: () => {},
  events: {
    on: () => {},
    off: () => {},
    emit: () => {},
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  defaultLocale: 'en',
  domainLocales: [],
  isPreview: false,
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

// Mock API response
const mockApiResponse = {
  comfy_nodes: mockComfyNodes,
  total: mockComfyNodes.length,
}

// Mock the API hook
vi.mock('@/src/api/generated', () => ({
  ComfyNodePolicy: {
    ComfyNodePolicyActive: 'ComfyNodePolicyActive',
    ComfyNodePolicyBanned: 'ComfyNodePolicyBanned',
    ComfyNodePolicyLocalOnly: 'ComfyNodePolicyLocalOnly',
  },
  useListAllComfyNodes: () => ({
    data: mockApiResponse,
    isLoading: false,
    refetch: () => {},
  }),
  useUpdateComfyNode: () => ({
    mutateAsync: async () => {},
    isPending: false,
  }),
}))

// Mock the router
vi.mock('next/router', () => ({
  useRouter: () => mockRouter,
}))

// Mock the auth HOC
vi.mock('@/components/common/HOC/authAdmin', () => ({
  default: (Component: any) => Component,
}))

// Mock the toast notifications
vi.mock('react-toastify', () => ({
  toast: {
    success: () => {},
    error: () => {},
  },
}))

// Wrapper component to provide necessary context
const ComfyNodesManageWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ComfyNodesManage />
    </QueryClientProvider>
  )
}

const meta: Meta<typeof ComfyNodesManageWrapper> = {
  title: 'Pages/Admin/ComfyNodesManage',
  component: ComfyNodesManageWrapper,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="dark min-h-screen bg-gray-900">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ComfyNodesManageWrapper>

export const Default: Story = {}

export const Loading: Story = {
  beforeEach() {
    vi.mocked(useListAllComfyNodes).mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: () => Promise.resolve({} as any),
    } as any)
  },
}

export const EmptyResults: Story = {
  beforeEach() {
    vi.mocked(useListAllComfyNodes).mockReturnValue({
      data: { comfy_nodes: [], total: 0 },
      isLoading: false,
      refetch: () => Promise.resolve({} as any),
    } as any)
  },
}
