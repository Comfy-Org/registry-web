import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UnclaimedNodeCard from "@/components/nodes/UnclaimedNodeCard";
import { Node } from "@/src/api/generated";

// Mock function for actions

const meta: Meta<typeof UnclaimedNodeCard> = {
  title: "Components/Nodes/UnclaimedNodeCard",
  component: UnclaimedNodeCard,
  parameters: {
    layout: "centered",
    backgrounds: { default: "dark" },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <div style={{ width: "800px", maxWidth: "100%" }}>
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof UnclaimedNodeCard>;

// Sample unclaimed node data
const sampleUnclaimedNode: Node = {
  id: "unclaimed-node-1",
  name: "Unclaimed Custom Node",
  description: "This is an unclaimed ComfyUI custom node that needs to be claimed by a publisher.",
  icon: "https://via.placeholder.com/200",
  downloads: 850,
  rating: 4.2,
  repository: "https://github.com/sample-user/unclaimed-comfy-node",
  publisher: {
    id: "unclaimed-admin",
    name: "Unclaimed Admin",
  },
};

export const Default: Story = {
  args: {
    node: sampleUnclaimedNode,
    onSuccess: () => {},
  },
};

export const WithoutIcon: Story = {
  args: {
    node: {
      ...sampleUnclaimedNode,
      icon: "",
    },
    onSuccess: () => {},
  },
};

export const LongDescription: Story = {
  args: {
    node: {
      ...sampleUnclaimedNode,
      description:
        'This is a very long description that will demonstrate how the component handles text overflow and line clamping. It should truncate with an ellipsis after a certain point to maintain the card layout and prevent the UI from breaking with very long content. Users can click "More" to see the full description on the node details page.',
    },
    onSuccess: () => {},
  },
};

export const LongName: Story = {
  args: {
    node: {
      ...sampleUnclaimedNode,
      name: "Very Long Node Name That Should Be Handled Properly In The Card Layout",
    },
    onSuccess: () => {},
  },
};

export const WithoutRepository: Story = {
  args: {
    node: {
      ...sampleUnclaimedNode,
      repository: undefined,
    },
    onSuccess: () => {},
  },
};

export const HighRating: Story = {
  args: {
    node: {
      ...sampleUnclaimedNode,
      rating: 4.9,
      downloads: 5000,
    },
    onSuccess: () => {},
  },
};

export const LowRating: Story = {
  args: {
    node: {
      ...sampleUnclaimedNode,
      rating: 2.1,
      downloads: 12,
    },
    onSuccess: () => {},
  },
};
