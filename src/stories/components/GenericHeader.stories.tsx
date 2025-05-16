import GenericHeader from '@/components/common/GenericHeader';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof GenericHeader> = {
  title: 'Components/Common/GenericHeader',
  component: GenericHeader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GenericHeader>;

export const Default: Story = {
  args: {
    title: 'Welcome to the Registry',
    subTitle: 'View nodes or sign in to create and publish your own',
    buttonText: 'Get Started',
    buttonLink: '/nodes',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Create a Node',
    subTitle: 'Add your custom node to the registry',
    buttonText: 'Create Node',
    buttonLink: '/nodes/create',
    showIcon: true,
  },
};

export const CustomColor: Story = {
  args: {
    title: 'Debug Console',
    subTitle: 'Advanced tools for developers',
    buttonText: 'Access Console',
    buttonLink: '/debug',
    buttonColor: 'red',
  },
};

