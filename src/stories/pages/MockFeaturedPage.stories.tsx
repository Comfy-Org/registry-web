import Container from '@/components/common/Container'
import GenericHeader from '@/components/common/GenericHeader'
import NodesCard from '@/components/nodes/NodesCard'
import { Meta, StoryObj } from '@storybook/nextjs-vite'

const PageLayout = () => {
    // Sample data for nodes
    const sampleNodes = [
        {
            id: 'node-1',
            name: 'Image Upscaler',
            description: 'A node that upscales images using AI technology',
            icon: 'https://picsum.photos/200/200',
            downloads: 2500,
            rating: 4.5,
        },
        {
            id: 'node-2',
            name: 'Text Generator',
            description:
                'Generates text based on prompts using advanced language models',
            icon: 'https://picsum.photos/200/200',
            downloads: 1800,
            rating: 4.2,
        },
        {
            id: 'node-3',
            name: 'Color Palette Generator',
            description:
                'Creates harmonious color palettes from images or base colors',
            icon: 'https://picsum.photos/200/200',
            downloads: 1200,
            rating: 3.9,
        },
    ]

    return (
        <div className="bg-gray-900 min-h-screen">
            <Container>
                <div className="pt-8">
                    <GenericHeader
                        title="Featured Nodes"
                        subTitle="Discover popular nodes for your workflow"
                        buttonText="View All"
                        buttonLink="/nodes"
                    />

                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-white mb-4">
                            {t('Popular_Nodes', 'Popular Nodes')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sampleNodes.map((node) => (
                                <NodesCard
                                    key={node.id}
                                    node={node}
                                    buttonLink={`/nodes/${node.id}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-xl font-bold text-white mb-4">
                            {t('Get_Started', 'Get Started')}
                        </h2>
                        <p className="text-gray-300 mb-4">{`${t('Create_your_own_nodes_and_share_them_with_the_community_Join_the_growing_ecosystem_of_developers_creating_amazing_tools_for_Comfy', 'Create your own nodes and share them with the community. Join the growing ecosystem of developers creating amazing tools for Comfy')}.`}</p>
                        <div className="flex gap-4">
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                                {t('Create_a_Node', 'Create a Node')}
                            </button>
                            <button className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                                {t('Learn_More', 'Learn More')}
                            </button>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}

const meta: Meta<typeof PageLayout> = {
    title: 'Pages/Mock/FeaturedNodesPage',
    component: PageLayout,
    parameters: {
        layout: 'fullscreen',
    },
}

export default meta
type Story = StoryObj<typeof PageLayout>

export const Default: Story = {}
