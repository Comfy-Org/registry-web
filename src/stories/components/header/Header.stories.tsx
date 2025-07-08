import Header from '@/components/Header/Header'
import { Meta, StoryObj } from '@storybook/react'
import { WithQueryClientProvider } from '../WithQueryClientProvider'

// Create a wrapper component to provide the query client
const HeaderWithQueryClient = (props) => {
    // Note: We're not modifying window.location as it's read-only
    // Instead, we'll use the already existing location object

    return (
        <WithQueryClientProvider>
            <Header {...props} />
        </WithQueryClientProvider>
    )
}

const meta: Meta<typeof HeaderWithQueryClient> = {
    title: 'Components/Header/Header',
    component: HeaderWithQueryClient,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Header>

export const LoggedOut: Story = {
    args: {
        isLoggedIn: false,
    },
}

export const LoggedIn: Story = {
    args: {
        isLoggedIn: true,
    },
}

export const WithTitle: Story = {
    args: {
        isLoggedIn: false,
        title: 'Custom Title',
    },
}

export const MobileView: Story = {
    args: {
        isLoggedIn: false,
    },
    parameters: {
        viewport: {
            defaultViewport: 'mobile1',
        },
    },
}

export const TabletView: Story = {
    args: {
        isLoggedIn: false,
    },
    parameters: {
        viewport: {
            defaultViewport: 'tablet',
        },
    },
}

export const DesktopView: Story = {
    args: {
        isLoggedIn: false,
    },
    parameters: {
        viewport: {
            defaultViewport: 'desktop',
        },
    },
}
