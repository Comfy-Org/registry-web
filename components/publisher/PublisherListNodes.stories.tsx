import { Meta, StoryObj } from "@storybook/nextjs-vite";
import PublisherListNodes from "@/components/publisher/PublisherListNodes";

const meta: Meta<typeof PublisherListNodes> = {
  title: "Components/Publisher/PublisherListNodes",
  component: PublisherListNodes,
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#111827" }],
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PublisherListNodes>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The PublisherListNodes component with the new publish instruction banner at the top.",
      },
    },
  },
};
