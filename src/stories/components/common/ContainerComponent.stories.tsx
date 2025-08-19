import Container from '@/components/common/Container'
import { Meta, StoryObj } from '@storybook/nextjs-vite'

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

export const Default: Story = {
    args: {
        children: (
            <div className="bg-gray-800 p-8 rounded-lg text-white">
                <h1 className="text-2xl font-bold mb-4">
                    {t('Content_inside_Container', 'Content inside Container')}
                </h1>
                <p>{`${t('This_content_is_wrapped_by_the_Container_component_which_provides_consistent_maxwidth_and_padding', 'This content is wrapped by the Container component, which provides consistent max-width and padding')}.`}</p>
            </div>
        ),
    },
}

export const WithMultipleChildren: Story = {
    args: {
        children: (
            <>
                <div className="bg-gray-800 p-8 rounded-lg text-white my-4">
                    <h2 className="text-xl font-bold mb-2">
                        {t('First_Section', 'First Section')}
                    </h2>
                    <p>
                        {t(
                            'Some_content_in_the_first_section',
                            'Some content in the first section'
                        )}
                    </p>
                </div>
                <div className="bg-gray-700 p-8 rounded-lg text-white my-4">
                    <h2 className="text-xl font-bold mb-2">
                        {t('Second_Section', 'Second Section')}
                    </h2>
                    <p>
                        {t(
                            'Some_content_in_the_second_section',
                            'Some content in the second section'
                        )}
                    </p>
                </div>
                <div className="bg-gray-600 p-8 rounded-lg text-white my-4">
                    <h2 className="text-xl font-bold mb-2">
                        {t('Third_Section', 'Third Section')}
                    </h2>
                    <p>
                        {t(
                            'Some_content_in_the_third_section',
                            'Some content in the third section'
                        )}
                    </p>
                </div>
            </>
        ),
    },
}
