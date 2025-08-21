import Container from '@/components/common/Container'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'
import { useNextTranslation } from '@/src/hooks/i18n'

// Define proper type for component props
interface ContainerProps {
    children: React.ReactNode
}

const meta: Meta<ContainerProps> = {
    title: 'Components/Common/Container',
    component: Container as React.FC<ContainerProps>,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

const EmptyComponent = () => {
    const { t } = useNextTranslation()
    return (
        <div className="h-[100px] w-full">
            {t('Empty_container', 'Empty container')}
        </div>
    )
}

export const Empty: Story = {
    args: {
        children: <EmptyComponent />,
    },
}

const WithContentComponent = () => {
    const { t } = useNextTranslation()
    return (
        <div className="p-8 bg-gray-800 rounded-lg my-8">
            <h1 className="text-2xl font-bold text-white mb-4">
                {t('Sample_Content', 'Sample Content')}
            </h1>
            <p className="text-gray-300">
                {t(
                    'This is an example of content inside the container component',
                    'This is an example of content inside the container component'
                )}
                .
            </p>
        </div>
    )
}

export const WithContent: Story = {
    args: {
        children: <WithContentComponent />,
    },
}

const WithMultipleItemsComponent = () => {
    const { t } = useNextTranslation()
    return (
        <>
            <div className="p-4 bg-blue-500 rounded-lg my-4">
                {t('Item', 'Item')} 1
            </div>
            <div className="p-4 bg-green-500 rounded-lg my-4">
                {t('Item', 'Item')} 2
            </div>
            <div className="p-4 bg-red-500 rounded-lg my-4">
                {t('Item', 'Item')} 3
            </div>
        </>
    )
}

export const WithMultipleItems: Story = {
    args: {
        children: <WithMultipleItemsComponent />,
    },
}
