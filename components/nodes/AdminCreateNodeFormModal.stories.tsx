import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AdminCreateNodeFormModal } from './AdminCreateNodeFormModal'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

const meta = {
    title: 'Components/Nodes/AdminCreateNodeFormModal',
    component: AdminCreateNodeFormModal,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
The AdminCreateNodeFormModal is used by administrators to add unclaimed nodes to the registry. 
It features a repository URL input at the top with a "Fetch Info" button that automatically 
populates form fields from the pyproject.toml file in GitHub repositories.

## Features
- Repository URL input with auto-fetch functionality
- Form validation using Zod schema
- Duplicate node detection
- Integration with React Hook Form
- Toast notifications for success/error states
                `,
            },
        },
    },
    decorators: [
        (Story) => {
            const queryClient = new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: false,
                    },
                },
            })
            return (
                <QueryClientProvider client={queryClient}>
                    <div style={{ minHeight: '600px' }}>
                        <Story />
                    </div>
                </QueryClientProvider>
            )
        },
    ],
    tags: ['autodocs'],
} satisfies Meta<typeof AdminCreateNodeFormModal>

export default meta
type Story = StoryObj<typeof meta>

// Story wrapper component to handle modal state
function ModalWrapper(args: React.ComponentProps<typeof AdminCreateNodeFormModal>) {
    const [open, setOpen] = useState(true)

    return (
        <AdminCreateNodeFormModal
            {...args}
            open={open}
            onClose={() => {
                console.log('Modal closed')
                setOpen(false)
                // Reopen after a delay for demo purposes
                setTimeout(() => setOpen(true), 1000)
            }}
        />
    )
}

export const Default: Story = {
    render: (args) => <ModalWrapper {...args} />,
    args: {
        open: true,
        onClose: () => console.log('onClose'),
    },
}

export const WithGitHubRepo: Story = {
    render: (args) => <ModalWrapper {...args} />,
    args: {
        open: true,
        onClose: () => console.log('onClose'),
    },
    parameters: {
        docs: {
            description: {
                story: `
This story demonstrates the modal with a GitHub repository URL pre-filled. 
In a real scenario, clicking "Fetch Info" would populate the form fields 
with data from the repository's pyproject.toml file.
                `,
            },
        },
    },
    play: async ({ canvasElement }) => {
        // You could add play interactions here to demonstrate the functionality
        // For example, filling in the repository field and clicking fetch
    },
}

export const Closed: Story = {
    render: () => (
        <AdminCreateNodeFormModal
            open={false}
            onClose={() => console.log('onClose')}
        />
    ),
    args: {
        open: false,
        onClose: () => console.log('onClose'),
    },
    parameters: {
        docs: {
            description: {
                story: 'The modal in its closed state.',
            },
        },
    },
}
