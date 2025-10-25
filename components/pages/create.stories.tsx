import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Breadcrumb, Card } from 'flowbite-react'
import { HiHome } from 'react-icons/hi'
import CreatePublisherFormContent from '@/components/publisher/CreatePublisherFormContent'

const CreatePublisherPageLayout = () => {
    const handleSuccess = (username: string) => {
        console.log('Publisher created successfully:', username)
        // In a real scenario, this would navigate to the publisher page
    }

    const handleCancel = () => {
        console.log('Create publisher cancelled')
        // In a real scenario, this would navigate back
    }

    return (
        <div className="p-4 bg-gray-900 min-h-screen">
            <div className="py-4">
                <Breadcrumb>
                    <Breadcrumb.Item
                        href="/"
                        icon={HiHome}
                        onClick={(e) => {
                            e.preventDefault()
                            console.log('Navigate to home')
                        }}
                        className="dark"
                    >
                        {t('Home', 'Home')}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item className="dark">
                        {t('Create_Publisher', 'Create Publisher')}
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <section className="p-0">
                <div className="flex items-center justify-center px-0 py-4 mx-auto">
                    <div className="w-full mx-auto shadow sm:max-w-lg">
                        <Card className="p-2 bg-gray-800 border border-gray-700 md:p-6 rounded-2xl">
                            <CreatePublisherFormContent
                                onSuccess={handleSuccess}
                                onCancel={handleCancel}
                                showTitle={true}
                            />
                        </Card>
                    </div>
                </div>
            </section>
        </div>
    )
}

const meta: Meta<typeof CreatePublisherPageLayout> = {
    title: 'Pages/Publishers/CreatePublisherPage',
    component: CreatePublisherPageLayout,
    parameters: {
        layout: 'fullscreen',
    },
}

export default meta
type Story = StoryObj<typeof CreatePublisherPageLayout>

export const Default: Story = {}
