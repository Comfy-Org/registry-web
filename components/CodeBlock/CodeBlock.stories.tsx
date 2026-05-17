import { Meta, StoryObj } from "@storybook/nextjs-vite";
import CopyableCodeBlock from "@/components/CodeBlock/CodeBlock";

const meta: Meta<typeof CopyableCodeBlock> = {
  title: "Components/CodeBlock",
  component: CopyableCodeBlock,
  parameters: {
    layout: "centered",
    backgrounds: { default: "dark" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CopyableCodeBlock>;

export const Default: Story = {
  args: {
    code: "comfy install my-node-id",
  },
};

export const LongCommand: Story = {
  args: {
    code: "comfy install my-node-id --token=12345abcde --registry=https://comfyregistry.org",
  },
};

export const MultiLine: Story = {
  args: {
    code: `npm install -g comfy-cli
comfy login
comfy install my-node-id`,
  },
};
