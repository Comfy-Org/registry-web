import { Meta, StoryObj } from "@storybook/nextjs-vite";
import Container from "@/components/common/Container";

const meta: Meta<typeof Container> = {
  title: "Components/Common/Container",
  component: Container,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Default: Story = {
  args: {
    children: (
      <div className="bg-gray-800 p-8 rounded-lg text-white">
        <h1 className="text-2xl font-bold mb-4">Content inside Container</h1>
        <p>
          This content is wrapped by the Container component, which provides consistent max-width
          and padding.
        </p>
      </div>
    ),
  },
};

export const WithMultipleChildren: Story = {
  args: {
    children: (
      <>
        <div className="bg-gray-800 p-8 rounded-lg text-white my-4">
          <h2 className="text-xl font-bold mb-2">First Section</h2>
          <p>Some content in the first section</p>
        </div>
        <div className="bg-gray-700 p-8 rounded-lg text-white my-4">
          <h2 className="text-xl font-bold mb-2">Second Section</h2>
          <p>Some content in the second section</p>
        </div>
        <div className="bg-gray-600 p-8 rounded-lg text-white my-4">
          <h2 className="text-xl font-bold mb-2">Third Section</h2>
          <p>Some content in the third section</p>
        </div>
      </>
    ),
  },
};
