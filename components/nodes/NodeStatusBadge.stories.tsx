import { Meta, StoryObj } from "@storybook/nextjs-vite";
import NodeStatusBadge from "@/components/nodes/NodeStatusBadge";
import { NodeStatus } from "@/src/api/generated";

// Create a wrapper component to provide necessary context
const meta: Meta<typeof NodeStatusBadge> = {
  title: "Components/Nodes/NodeStatusBadge",
  component: NodeStatusBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NodeStatusBadge>;

export const Banned: Story = {
  args: {
    status: NodeStatus.NodeStatusBanned,
  },
};

export const Active: Story = {
  args: {
    status: NodeStatus.NodeStatusActive,
  },
};

export const Deleted: Story = {
  args: {
    status: NodeStatus.NodeStatusDeleted,
  },
};
