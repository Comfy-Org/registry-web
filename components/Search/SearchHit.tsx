import { ShortNumber } from '@lytieuphong/short-number'
import { Tooltip } from 'flowbite-react'
import type {
    HitAttributeHighlightResult,
    HitAttributeSnippetResult,
    Hit as HitType,
} from 'instantsearch.js'
import Link from 'next/link'
import React from 'react'
import { HiDownload } from 'react-icons/hi'
import { Snippet } from 'react-instantsearch'
import Markdown from 'react-markdown'
interface NodeHit {
    id: string
    name: string
    description: string
    publisher_id: string
    total_install: number
    latest_version: string

    comfy_nodes?: string[]
}

type HitProps = {
    hit: HitType<NodeHit>
}

const Hit: React.FC<HitProps> = ({ hit }) => {
    const matchedNodes = (
        hit._highlightResult?.comfy_nodes as
        | HitAttributeHighlightResult[]
        | undefined
    )?.filter((e) => (e.matchedWords as string[])?.length)
    return (
        <Link
            className="flex flex-col bg-gray-800 rounded-lg cursor-pointer h-full dark:border-gray-700 lg:p-4"
            href={`/nodes/${hit.id}`}
            rel="noopener noreferrer"
        // target="_blank"
        >
            <div className="flex flex-col">
                <h6 className="mb-2 text-base font-bold tracking-tight text-white break-words">
                    <Snippet hit={hit} attribute="name" />
                </h6>

                {/* description */}
                <p className="mb-1 text-xs font-light text-white mt-2">
                    <Markdown>
                        {/* <Snippet hit={hit} attribute="description" /> */}
                        {(
                            hit._snippetResult
                                ?.description as HitAttributeSnippetResult
                        )?.value.replace(/<\/?mark>/g, '**')}
                    </Markdown>
                </p>

                {/* nodes */}
                {hit.comfy_nodes?.length && (
                    <div className="mb-1 text-xs font-light text-white mt-2 flex-row flex gap-2 whitespace-nowrap overflow-hidden overflow-ellipsis">
                        <Tooltip
                            content={
                                <pre className="max-w-[20em] max-h-[8em] overflow-auto whitespace-pre-wrap break-all">
                                    {hit.comfy_nodes?.join(', \n') ?? ''}
                                </pre>
                            }
                            placement="bottom"
                        >
                            {matchedNodes?.length ? (
                                <>
                                    {matchedNodes?.length ?? 0}/
                                    {hit.comfy_nodes?.length ?? 0} Nodes
                                    matched:
                                    {matchedNodes
                                        ?.map((e) =>
                                            e.value?.replace(/<\/?mark>/g, '**')
                                        )
                                        .filter((e) => e)
                                        .map((name) => (
                                            <div key={name}>
                                                <Markdown>{name}</Markdown>
                                            </div>
                                        ))}
                                </>
                            ) : (
                                <>{hit.comfy_nodes?.length ?? 0} Nodes</>
                            )}
                        </Tooltip>
                    </div>
                )}

                {/* meta info */}
                <p className="mb-1 text-xs font-light text-nowrap mt-2 text-gray-400">
                    @{hit.publisher_id}
                    {hit.latest_version && (
                        <span className="">
                            {' | '}
                            <span>v{hit.latest_version}</span>
                        </span>
                    )}
                    {hit.total_install && (
                        <span className="">
                            {' | '}
                            <HiDownload className='inline h-3 w-3' title='Installs' /> {ShortNumber(hit.total_install)}
                        </span>
                    )}
                </p>

                {/* <div className="flex items-center flex-start align-center gap-1 mt-2">
                    {hit.total_install != 0 && (
                        <p className="flex justify-center text-center align-center">
                            <svg
                                className="w-4 h-4 text-white"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 13V4M7 14H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2m-1-5-4 5-4-5m9 8h.01"
                                />
                            </svg>
                            <p className="ml-1 text-xs font-bold text-white">
                                {hit.total_install}
                            </p>
                        </p>
                    )}
                </div> */}
            </div>
        </Link>
    )
}

export default Hit
