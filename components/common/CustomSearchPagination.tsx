import React from 'react'
import { Pagination as FlowbitePagination } from 'flowbite-react'
import { usePagination, UsePaginationProps } from 'react-instantsearch'
import { CustomThemePagination } from 'utils/comfyTheme'

export default function CustomSearchPagination(props: UsePaginationProps) {
    const {
        pages,
        currentRefinement,
        nbPages,
        isFirstPage,
        isLastPage,
        refine,
        createURL,
    } = usePagination(props)

    const handlePageChange = (page: number) => {
        refine(page - 1) // Flowbite uses 1-based indexing, InstantSearch uses 0-based
    }

    return (
        <div className="flex mt-2 sm:justify-center">
            <FlowbitePagination
                theme={CustomThemePagination as any} // Add 'as any' to bypass type checking
                currentPage={currentRefinement + 1}
                totalPages={nbPages}
                onPageChange={handlePageChange}
                showIcons={true}
                previousLabel="Previous"
                nextLabel="Next"
                layout="pagination"
            />
        </div>
    )
}

function isModifierClick(event: React.MouseEvent) {
    const isMiddleClick = event.button === 1
    return Boolean(
        isMiddleClick ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey
    )
}
