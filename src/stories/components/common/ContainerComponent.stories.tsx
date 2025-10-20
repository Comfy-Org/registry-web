import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useNextTranslation } from '@/src/hooks/i18n'
import Container from '@/components/common/Container'

const meta: Meta<typeof Container> = {
    title: 'Components/Common/Container',
    component: Container,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Container>

const DefaultComponent = () => {
    const { t } = useNextTranslation()
    return (
        <div className="bg-gray-800 p-8 rounded-lg text-white">
            <h1 className="text-2xl font-bold mb-4">
                {t('Content inside Container', 'Content inside Container')}
            </h1>
            <p>
                {t(
                    'This content is wrapped by the Container component, which provides consistent max-width and padding',
                    'This content is wrapped by the Container component, which provides consistent max-width and padding'
                )}
                .
            </p>
        </div>
    )
}

export const Default: Story = {
    args: {
        children: <DefaultComponent />,
    },
}

const WithMultipleChildrenComponent = () => {
    const { t } = useNextTranslation()
    return (
        <>
            <div className="bg-gray-800 p-8 rounded-lg text-white my-4">
                <h2 className="text-xl font-bold mb-2">
                    {t('First Section', 'First Section')}
                </h2>
                <p>
                    {t(
                        'Some content in the first section',
                        'Some content in the first section'
                    )}
                </p>
            </div>
            <div className="bg-gray-700 p-8 rounded-lg text-white my-4">
                <h2 className="text-xl font-bold mb-2">
                    {t('Second Section', 'Second Section')}
                </h2>
                <p>
                    {t(
                        'Some content in the second section',
                        'Some content in the second section'
                    )}
                </p>
            </div>
            <div className="bg-gray-600 p-8 rounded-lg text-white my-4">
                <h2 className="text-xl font-bold mb-2">
                    {t('Third Section', 'Third Section')}
                </h2>
                <p>
                    {t(
                        'Some content in the third section',
                        'Some content in the third section'
                    )}
                </p>
            </div>
        </>
    )
}

export const WithMultipleChildren: Story = {
    args: {
        children: <WithMultipleChildrenComponent />,
    },
}
