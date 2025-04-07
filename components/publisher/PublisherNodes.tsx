import { Pagination } from 'flowbite-react'
import Link from 'next/link'
import * as React from 'react'
import { Publisher, useListNodesForPublisherV2 } from 'src/api/generated'
import { CustomThemePagination } from 'utils/comfyTheme'
import NodesCard from '../nodes/NodesCard'

type PublisherNodesProps = {
    publisher: Publisher
    onEditPublisher?: () => void
    include_banned?: boolean
}

/**
 *
 * Lists the nodes for a publisher
 */
const PublisherNodes: React.FC<PublisherNodesProps> = ({
    publisher,
    onEditPublisher,
    include_banned = false,
}) => {
    const [page, setPage] = React.useState(0)
    const { data, isError, isLoading } = useListNodesForPublisherV2(
        publisher.id as string,
        { page, include_banned }
    )

    return (
        <div className="pt-20">
            <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold leading-tight tracking-tight text-white sm:text-2xl">
                    <Link href={`publishers/${publisher.id}`}>
                        {publisher.name !== '' ? publisher.name : publisher.id}
                    </Link>
                </h1>

                <div onClick={onEditPublisher} hidden={!onEditPublisher}>
                    <svg
                        className="w-[20px] h-[17px] text-white ml-2"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"
                        />
                    </svg>
                </div>
            </div>

            <div className="grid gap-4 pt-8 mb-6 lg:mb-5 md:grid-cols-2 lg:grid-cols-3">
                {data?.nodes?.map((node, index) => (
                    <NodesCard
                        key={index}
                        node={node}
                        buttonLink={`publishers/${publisher.id}/nodes/${node.id}`}
                    />
                ))}
            </div>

            {data?.totalPages && (
                <Pagination
                    theme={CustomThemePagination as any} // Add 'as any' to bypass type checking
                    currentPage={page + 1}
                    totalPages={data.totalPages}
                    onPageChange={(page) => setPage(page - 1)}
                    showIcons={true}
                    previousLabel="Previous"
                    nextLabel="Next"
                    layout="pagination"
                />
            )}
        </div>
    )
}

export default PublisherNodes
