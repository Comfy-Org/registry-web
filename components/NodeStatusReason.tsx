import { DiffEditor, Editor } from '@monaco-editor/react'
import { compareBy } from 'comparing'
import { Button } from 'flowbite-react'
import Link from 'next/link'
import prettierPluginBabel from 'prettier/plugins/babel'
import prettierPluginEstree from 'prettier/plugins/estree'
import prettierPluginYaml from 'prettier/plugins/yaml'
import { format } from 'prettier/standalone'
import { tryCatch } from 'rambda'
import { useEffect, useState } from 'react'
import { FaChevronDown, FaGithub, FaHistory } from 'react-icons/fa'
import { MdEdit, MdOpenInNew } from 'react-icons/md'
import { useInView } from 'react-intersection-observer'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import {
    NodeVersion,
    NodeVersionStatus,
    useGetNode,
    useListNodeVersions,
} from 'src/api/generated'
import { NodeVersionStatusToReadable } from 'src/mapper/nodeversion'
import yaml from 'yaml'
import { z } from 'zod'
import { NodeStatusBadge } from './NodeStatusBadge'
import { parseIssueList } from './parseIssueList'
import { parseJsonSafe } from './parseJsonSafe'

// schema reference from (private): https://github.com/Comfy-Org/security-scanner
export const zErrorArray = z
    .object({
        issue_type: z.string(), // The error type is represented as a string
        file_path: z.string().optional(), // File name is a string and may or may not be present
        line_number: z.number().optional(), // Line number can be a string or number and may or may not be present
        code_snippet: z.string().optional(), // Line content where the error is found is a string and optional
        message: z.string().optional(), // Line content where the error is found is a string and optional
        scanner: z.string().optional(), // Scanner name is a string and optional
        // yara
        // meta: z
        //     .object({
        //         description: z.string(),
        //         version: z.string(),
        //         date: z.string(),
        //         reference: z.string(),
        //         category: z.string(),
        //         observable_refs: z.string(),
        //         attack_id1: z.string(),
        //         attack_id2: z.string(),
        //         severity: z.string(),
        //     })
        //     .passthrough()
        //     .optional(), // Meta information is optional and contains a detailed description if present
        // yara
        // matches: z
        //     .array(
        //         z
        //             .object({
        //                 filepath: z.string(),
        //                 strings: z.array(
        //                     z.object({
        //                         identifier: z.string(),
        //                         instances: z.array(
        //                             z.object({
        //                                 matched_data: z.string(),
        //                                 matched_length: z.number(),
        //                                 offset: z.number(),
        //                                 line_number: z.number(),
        //                                 line: z.string(),
        //                             })
        //                         ),
        //                     })
        //                 ),
        //             })
        //             .passthrough()
        //             .optional()
        //     )
        //     .optional(), // Matches array, if present, contains detailed match information
    })
    .passthrough()
    .array()

export const zStatusCode = z.enum(
    Object.values(NodeVersionStatus) as [
        NodeVersionStatus,
        ...NodeVersionStatus[],
    ]
)

export const zStatusHistory = z.array(
    z.object({
        status: zStatusCode,
        message: z.string(),
        by: z.string().optional(),
    })
)

// when status is active/banned, the statusReason is approve/reject reason, and maybe a status history
export const zStatusReason = z.object({
    message: z.string(),
    by: z.string(),

    // statusHistory, allow undo
    statusHistory: zStatusHistory.optional(),

    // batchId for batch operations (for future batch-undo)
    batchId: z.string().optional(),
})

export function NodeStatusReason(nv: NodeVersion) {
    const { node_id, status_reason } = nv
    const { ref, inView } = useInView()

    // TODO: migrate this to comfy-api, bring node information to /versions
    const { data: node } = useGetNode(
        node_id!,
        {},
        { query: { enabled: inView } }
    )

    // Get last nodeversion, sorted by time
    const { data: nodeVersions } = useListNodeVersions(
        node_id!,
        { include_status_reason: true },
        { query: { enabled: inView } }
    )
    nodeVersions?.sort(compareBy((e) => e.createdAt || e.id || ''))

    // query last node versions
    const currentNodeVersionIndex =
        nodeVersions?.findIndex((nodeVersion) => nodeVersion.id === nv.id) ?? -1
    const lastApprovedNodeVersion = nodeVersions?.findLast(
        (nv, i) =>
            nv.status === NodeVersionStatus.NodeVersionStatusActive &&
            i < currentNodeVersionIndex
    )
    // const lastBannedNodeVersion = nodeVersions?.find(
    //     (nv, i) =>
    //         nv.status === NodeVersionStatus.NodeVersionStatusBanned &&
    //         i < currentNodeVersionIndex
    // )
    // const lastFlaggedNodeVersion = nodeVersions?.find(
    //     (nv, i) =>
    //         nv.status === NodeVersionStatus.NodeVersionStatusFlagged &&
    //         i < currentNodeVersionIndex
    // )
    // const lastNodeVersion = nodeVersions?.at(-2)

    // parse status reason
    const issueList = parseIssueList(parseJsonSafe(status_reason ?? '').data)
    // const lastVersionIssueList = parseIssueList(parseJsonSafe(lastNodeVersion.status_reason ?? '').data)

    // assume all issues are approved if last node version is approved
    const approvedIssueList = parseIssueList(
        parseJsonSafe(
            zStatusReason
                .safeParse(
                    parseJsonSafe(lastApprovedNodeVersion?.status_reason ?? '')
                        .data
                )
                .data?.statusHistory?.findLast(
                    (e) =>
                        e.status === NodeVersionStatus.NodeVersionStatusFlagged
                )?.message
        ).data
    )

    // const statusReason =
    //     zStatusReason.safeParse(statusReasonJson).data ??
    //     zStatusReason.parse({ message: status_reason, by: 'admin@comfy.org' })

    const fullfilledIssueList = issueList
        // guess url from node
        ?.map((e) => {
            const repoUrl = node?.repository || ''
            const filepath =
                repoUrl &&
                (e.file_path || '') &&
                `/blob/HEAD/${e.file_path?.replace(/^\//, '')}`
            const linenumber =
                filepath && (e.line_number || '') && `#L${e.line_number}`
            const url = repoUrl + filepath + linenumber
            return { ...e, url }
        })
        // mark if the issue was approved before
        ?.map((e) => {
            const isApproved = approvedIssueList?.some(
                (approvedIssue) =>
                    approvedIssue.file_path === e.file_path &&
                    approvedIssue.line_number === e.line_number &&
                    approvedIssue.code_snippet === e.code_snippet
            )
            return { ...e, isApproved }
        })

    const lastFullfilledIssueList = approvedIssueList // guess url from node
        ?.map((e) => {
            const repoUrl = node?.repository || ''
            const filepath =
                repoUrl &&
                (e.file_path || '') &&
                `/blob/HEAD/${e.file_path?.replace(/^\//, '')}`
            const linenumber =
                filepath && (e.line_number || '') && `#L${e.line_number}`
            const url = repoUrl + filepath + linenumber
            return { ...e, url }
        })
        // mark if the issue was approved before
        ?.map((e) => {
            const isApproved = true
            return { ...e, isApproved }
        })

    // get a summary for the issues, including weather it was approved before
    const problemsSummary = fullfilledIssueList?.sort(
        compareBy(
            (e) =>
                // sort by approved before
                (e.isApproved ? '0' : '1') +
                // and then filepath + line number (padStart to order numbers by number, instead of string)
                e.url
                    .split(/\b/)
                    .map(
                        (strOrNumber) =>
                            z
                                .number()
                                .safeParse(strOrNumber)
                                .data?.toString()
                                .padStart(10, '0') ?? strOrNumber
                    )
                    .join('')
        )
    )

    const lastCode = lastFullfilledIssueList
        ? JSON.stringify(lastFullfilledIssueList)
        : (lastApprovedNodeVersion?.status_reason ?? '')
    const code = fullfilledIssueList
        ? JSON.stringify(fullfilledIssueList)
        : status_reason
    return (
        <div className="text-[18px] pt-2 text-gray-300" ref={ref}>
            {/* HistoryVersions */}
            {(nodeVersions?.length ?? null) && (
                <details>
                    <summary className="flex gap-2 items-center">
                        <FaChevronDown className="w-5 h-5" />

                        <h4 className="text-lg font-bold flex gap-2 items-center cursor-pointer ">
                            <FaHistory className="w-5 h-5 ml-4" />
                            Node history:
                        </h4>
                        <ul className="ml-4 flex gap-2 overflow-x-auto">
                            {Object.entries(
                                nodeVersions!.reduce(
                                    (acc, nv) => {
                                        acc[nv.status!] =
                                            (acc[nv.status!] || 0) + 1
                                        return acc
                                    },
                                    {} as Record<NodeVersionStatus, number>
                                )
                            ).map(([status, count]) => (
                                <li
                                    key={status}
                                    className="flex gap-2 items-center"
                                >
                                    <NodeStatusBadge
                                        status={status as NodeVersionStatus}
                                        count={count}
                                    />
                                </li>
                            ))}
                        </ul>

                        <Link
                            href={`/admin/nodeversions?nodeId=${nv.node_id}`}
                            target="_blank"
                            className="button flex-0 hover:bg-gray-700 hover:text-white transition-colors"
                            title={`View all node versions for ${nv.node_id}`}
                            legacyBehavior>
                            <MdOpenInNew className="w-6 h-6" />
                        </Link>
                    </summary>
                    <div className="overflow-x-auto overflow-hidden max-w-full">
                        <ol className="ml-4 w-max">
                            {nodeVersions?.map((nv) => (
                                <li
                                    key={nv.id}
                                    className={`w-full min-w-max flex gap-2 text-xs whitespace-nowrap ${
                                        nodeVersions?.indexOf(nv) ===
                                        currentNodeVersionIndex
                                            ? 'bg-gray-700 text-white'
                                            : ''
                                    }`}
                                    title={`${nv.version} ${NodeVersionStatusToReadable(
                                        nv.status
                                    )} ${
                                        zStatusReason.safeParse(
                                            nv.status_reason
                                        ).data?.message ?? nv.status_reason
                                    }${
                                        zStatusReason.safeParse(
                                            nv.status_reason
                                        ).data?.batchId
                                            ? ` [Batch: ${
                                                  zStatusReason.safeParse(
                                                      nv.status_reason
                                                  ).data?.batchId
                                              }]`
                                            : ''
                                    }`}
                                >
                                    <div className="sticky left-0 z-10 flex gap-1 whitespace-nowrap bg-gray-800 w-[8rem] justify-end flex-0 justify-between">
                                        <NodeStatusBadge
                                            status={
                                                nv.status as NodeVersionStatus
                                            }
                                        />
                                        {nv.version}
                                        <Link
                                            href={`/admin/nodeversions?nodeId=${nv.node_id}&version=${nv.version}`}
                                            target="_blank"
                                            className="button flex-0 hover:bg-gray-700 hover:text-white transition-colors"
                                            legacyBehavior>
                                            <MdOpenInNew className="w-4 h-4" />
                                        </Link>
                                    </div>
                                    <code
                                        className="text-gray-400 whitespace-nowrap flex-1"
                                        title={`${nv.version} ${NodeVersionStatusToReadable(
                                            nv.status
                                        )} ${
                                            zStatusReason.safeParse(
                                                nv.status_reason
                                            ).data?.message ?? nv.status_reason
                                        }${
                                            zStatusReason.safeParse(
                                                nv.status_reason
                                            ).data?.batchId
                                                ? ` [Batch: ${
                                                      zStatusReason.safeParse(
                                                          nv.status_reason
                                                      ).data?.batchId
                                                  }]`
                                                : ''
                                        }`}
                                    >
                                        {zStatusReason.safeParse(
                                            nv.status_reason
                                        ).data?.message ?? nv.status_reason}
                                        {zStatusReason.safeParse(
                                            nv.status_reason
                                        ).data?.batchId && (
                                            <span className="ml-2 text-xs text-gray-500">
                                                [Batch:{' '}
                                                {
                                                    zStatusReason.safeParse(
                                                        nv.status_reason
                                                    ).data?.batchId
                                                }
                                                ]
                                            </span>
                                        )}
                                    </code>
                                </li>
                            ))}
                        </ol>
                    </div>
                </details>
            )}
            {!!problemsSummary?.length && (
                <>
                    <h4>{'Problems Summary: '}</h4>
                    <ol className="ml-4 overflow-x-auto">
                        {problemsSummary.map((e, i) => (
                            <li
                                key={i}
                                className="flex gap-2 items-center w-full justify-start text-xs"
                                title={`${yaml.stringify(e)}`}
                            >
                                <div className="sticky left-0 z-10 flex gap-1 whitespace-nowrap bg-gray-800 w-[14rem]">
                                    {/* show green checkmark if approved before */}
                                    {e.isApproved ? (
                                        <span className="text-green-500">
                                            ✅
                                        </span>
                                    ) : (
                                        <span className="text-red-500">❓</span>
                                    )}
                                    <Link href={e.url} target="_blank" className="button flex-0" legacyBehavior>
                                        <FaGithub className="w-5 h-5 ml-4" />
                                    </Link>
                                    <code className="text-gray-400 whitespace-nowrap flex-1">
                                        {(e.file_path?.length ?? 0) > 18 + 2
                                            ? `…${e.file_path?.slice(-18)}`
                                            : e.file_path}
                                        &nbsp;L{e.line_number}
                                    </code>
                                </div>
                                <code className="flex-1 ml-4 whitespace-nowrap text">
                                    &nbsp;
                                    {e.issue_type}
                                    &nbsp;
                                    {e.code_snippet || e.message}
                                </code>
                            </li>
                        ))}
                    </ol>
                </>
            )}
            {!!code?.trim() && (
                <details open={!problemsSummary}>
                    <summary>{'Status Reason: '}</summary>
                    {fullfilledIssueList ? (
                        <PrettieredYamlDiffView
                            original={lastCode}
                            modified={code}
                        />
                    ) : (
                        <PrettieredYAML>{code}</PrettieredYAML>
                    )}
                </details>
            )}
        </div>
    );
}

export function PrettieredJSON5({ children: raw }: { children: string }) {
    const [code, setCode] = useState(raw)
    useEffect(() => {
        format(raw ?? '', {
            parser: 'json5',
            plugins: [prettierPluginBabel, prettierPluginEstree],
        }).then(setCode)
    }, [raw])
    return (
        <SyntaxHighlighter language="json5" style={dark}>
            {code}
        </SyntaxHighlighter>
    )
}

export function PrettieredYAML({ children: raw }: { children: string }) {
    const { ref, inView } = useInView()

    const parsedYaml = tryCatch(
        (raw: string) => yaml.stringify(yaml.parse(raw)),
        raw
    )(raw)

    const [code, setCode] = useState(parsedYaml)
    useEffect(() => {
        format(parsedYaml, {
            parser: 'yaml',
            plugins: [prettierPluginYaml],
        }).then(setCode)
    }, [parsedYaml])

    const [isEditorOpen, setEditorOpen] = useState(false)
    const [editorReady, setEditorReady] = useState(false)
    const displayEditor = isEditorOpen && editorReady
    useEffect(() => {
        if (isEditorOpen === false) setEditorReady(false)
    }, [isEditorOpen])

    return (
        <div className="relative" ref={ref}>
            {inView && (
                <div className="absolute right-5 top-5 z-10">
                    <Button
                        onClick={() => setEditorOpen((e) => !e)}
                        color={'gray'}
                    >
                        <MdEdit className="w-5 h-5" />
                        Toggle Editor
                    </Button>
                </div>
            )}
            {!displayEditor && (
                <SyntaxHighlighter
                    language="yaml"
                    style={dark}
                    className="overflow-auto max-h-[30rem]"
                >
                    {code}
                </SyntaxHighlighter>
            )}

            {isEditorOpen && (
                <Editor
                    className={!displayEditor ? 'hidden' : ''}
                    language="yaml"
                    options={{ readOnly: true }}
                    theme={'vs-dark'}
                    height={'30rem'}
                    value={code}
                    onMount={() => setEditorReady(true)}
                />
            )}
        </div>
    )
}

export function PrettieredYamlDiffView({
    original: rawOriginal,
    modified: rawModified,
}: {
    original: string
    modified: string
}) {
    const { ref, inView } = useInView()

    const parsedModified = tryCatch(
        (raw: string) => raw && yaml.stringify(yaml.parse(raw)),
        rawModified
    )(rawModified)
    const parsedOriginal = tryCatch(
        (raw: string) => raw && yaml.stringify(yaml.parse(raw)),
        rawOriginal
    )(rawOriginal)

    const [codeOriginal, setCodeOriginal] = useState(parsedOriginal)
    const [codeModified, setCodeModified] = useState(parsedModified)

    useEffect(() => {
        format(parsedOriginal, {
            parser: 'yaml',
            plugins: [prettierPluginYaml],
        }).then(setCodeOriginal)
    }, [parsedOriginal])
    useEffect(() => {
        format(parsedModified, {
            parser: 'yaml',
            plugins: [prettierPluginYaml],
        }).then(setCodeModified)
    }, [parsedModified])

    const [isEditorOpen, setEditorOpen] = useState(true)
    const [editorReady, setEditorReady] = useState(false)
    const displayEditor = isEditorOpen && editorReady
    useEffect(() => {
        if (isEditorOpen === false) setEditorReady(false)
    }, [isEditorOpen])

    return (
        <div className="relative" ref={ref}>
            {inView && (
                <div className="absolute right-5 top-5 z-10">
                    <Button
                        onClick={() => setEditorOpen((e) => !e)}
                        color={'gray'}
                    >
                        <MdEdit className="w-5 h-5" />
                        Toggle Editor
                    </Button>
                </div>
            )}

            {isEditorOpen && (
                <DiffEditor
                    className={!displayEditor ? 'hidden' : ''}
                    language="yaml"
                    options={{ readOnly: true }}
                    theme={'vs-dark'}
                    height={'30rem'}
                    original={codeOriginal}
                    modified={codeModified}
                    onMount={() => setEditorReady(true)}
                />
            )}
        </div>
    )
}
