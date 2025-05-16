import { ClearableLabel } from '@/components/Labels/ClearableLabel'
import { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

// We need to use a functional component for this because it has state
const ClearableLabelWithState = ({
    label,
    initialValue = '',
    disabled = false,
}) => {
    const [value, setValue] = useState(initialValue)

    return (
        <ClearableLabel
            id="storybook-clearable-label"
            label={label}
            value={value}
            onChange={setValue}
            onClear={() => setValue('')}
            disabled={disabled}
        />
    )
}

const meta: Meta<typeof ClearableLabelWithState> = {
    title: 'Components/Labels/ClearableLabel',
    component: ClearableLabelWithState,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ClearableLabelWithState>

export const Empty: Story = {
    args: {
        label: 'Search',
        initialValue: '',
    },
}

export const WithValue: Story = {
    args: {
        label: 'Search',
        initialValue: 'Text to clear',
    },
}

export const Disabled: Story = {
    args: {
        label: 'Search (Disabled)',
        initialValue: 'Cannot be cleared',
        disabled: true,
    },
}
