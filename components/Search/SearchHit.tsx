import { useNextTranslation } from '@/src/hooks/i18n'
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
import { PublisherId } from './PublisherId'
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
    const { t } = useNextTranslation()
    const matchedNodes = (
        hit._highlightResult?.comfy_nodes as
            | HitAttributeHighlightResult[]
            | undefined
    )?.filter((e) => (e.matchedWords as string[])?.length)
    return (
        <Link
            className="flex flex-col bg-gray-800 rounded-lg h-full dark:border-gray-700"
            href={`/nodes/${hit.id}`}
            rel="noopener noreferrer"
        >
            <div className="flex flex-col flex-grow">
                <h6 className="mb-2 text-base font-bold tracking-tight text-white break-words">
                    <Snippet hit={hit} attribute="name" />
                </h6>

                {/* description */}
                <Markdown
                    components={{
                        p: ({ children }) => (
                            <p className="mb-1 text-xs font-light text-white mt-2 overflow-hidden text-ellipsis line-clamp-2">
                                {children}
                            </p>
                        ),
                    }}
                >
                    {(
                        hit._snippetResult
                            ?.description as HitAttributeSnippetResult
                    )?.value.replace(/<\/?mark>/g, '**')}
                </Markdown>

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
            </div>
            {/* meta info */}
            <p className="text-xs font-light text-nowrap mt-2 text-gray-400">
                <PublisherId publisherId={hit.publisher_id} />
                {hit.latest_version && (
                    <span className="">
                        {' | '}
                        <span>v{hit.latest_version}</span>
                    </span>
                )}
                {hit.total_install && (
                    <span className="">
                        {' | '}
                        <HiDownload
                            className="inline h-3 w-3"
                            title={t('Installs')}
                        />{' '}
                        {ShortNumber(hit.total_install)}
                    </span>
                )}
            </p>
        </Link>
    )
}

export default Hit
