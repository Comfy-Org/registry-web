import { Meta, StoryObj } from "@storybook/nextjs-vite";
import Header from "@/components/Header/Header";

const meta: Meta<typeof Header> = {
  title: "Components/Header/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Header>;

export const LoggedOut: Story = {
  args: {
    isLoggedIn: false,
  },
};

export const LoggedIn: Story = {
  args: {
    isLoggedIn: true,
  },
};

export const WithTitle: Story = {
  args: {
    isLoggedIn: false,
    title: "Custom Title",
  },
};
