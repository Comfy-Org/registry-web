import type { Meta, StoryObj } from '@storybook/react'
import CustomSearchPagination from '../../../../components/common/CustomSearchPagination'
import { InstantSearch } from 'react-instantsearch'
import algoliasearch from 'algoliasearch/lite'

// Create a mock search client for Storybook
const searchClient = algoliasearch('mock-app-id', 'mock-search-key')

const meta = {
    title: 'Components/Common/CustomSearchPagination',
    component: CustomSearchPagination,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <InstantSearch searchClient={searchClient} indexName="nodes_index">
                <Story />
            </InstantSearch>
        ),
    ],
} satisfies Meta<typeof CustomSearchPagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {},
}

export const WithPadding: Story = {
    args: {
        padding: 2,
    },
}