import Container from '@/components/common/Container'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

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

export const Empty: Story = {
    args: {
        children: (
            <div className="h-[100px] w-full">
                {t('Empty_container', 'Empty container')}
            </div>
        ),
    },
}

export const WithContent: Story = {
    args: {
        children: (
            <div className="p-8 bg-gray-800 rounded-lg my-8">
                <h1 className="text-2xl font-bold text-white mb-4">
                    {t('Sample_Content', 'Sample Content')}
                </h1>
                <p className="text-gray-300">{`${t('This_is_an_example_of_content_inside_the_container_component', 'This is an example of content inside the container component')}.`}</p>
            </div>
        ),
    },
}

export const WithMultipleItems: Story = {
    args: {
        children: (
            <>
                <div className="p-4 bg-blue-500 rounded-lg my-4">{`${t('Item', 'Item')} 1`}</div>
                <div className="p-4 bg-green-500 rounded-lg my-4">{`${t('Item', 'Item')} 2`}</div>
                <div className="p-4 bg-red-500 rounded-lg my-4">{`${t('Item', 'Item')} 3`}</div>
            </>
        ),
    },
}
