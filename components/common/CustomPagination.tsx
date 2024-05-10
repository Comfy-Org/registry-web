import { Pagination as FlowbitePagination } from 'flowbite-react'
import { CustomThemePagination } from 'utils/comfyTheme'

export function CustomPagination({ currentPage, onPageChange, totalPages }) {
    return (
        <div className="flex mt-2 sm:justify-center">
            <FlowbitePagination
                //@ts-ignore
                theme={CustomThemePagination}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
        </div>
    )
}
