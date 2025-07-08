import type { Meta, StoryObj } from '@storybook/react'
import LanguageSwitcher from '../../../../components/common/LanguageSwitcher'

const meta = {
    title: 'Components/Common/LanguageSwitcher',
    component: LanguageSwitcher,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        className: {
            control: 'text',
            description: 'Additional CSS classes to apply to the component',
        },
    },
} satisfies Meta<typeof LanguageSwitcher>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {},
}

export const WithCustomClass: Story = {
    args: {
        className: 'my-4',
    },
}