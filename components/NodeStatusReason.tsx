import { Editor } from '@monaco-editor/react'
import { compareBy } from 'comparing'
import { Button } from 'flowbite-react'
import Link from 'next/link'
import prettierPluginBabel from 'prettier/plugins/babel'
import prettierPluginEstree from 'prettier/plugins/estree'
import prettierPluginYaml from 'prettier/plugins/yaml'
import { format } from 'prettier/standalone'
import { tryCatch } from 'rambda'
import { useEffect, useState } from 'react'
import { FaGithub } from 'react-icons/fa'
import { MdEdit } from 'react-icons/md'
import { useInView } from 'react-intersection-observer'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { NodeVersion, NodeVersionStatus, useGetNode } from 'src/api/generated'
import yaml from 'yaml'
import { z } from 'zod'
import { parseJsonSafe } from './parseJsonSafe'

// schema reference from (private): https://github.com/Comfy-Org/security-scanner
export const zErrorArray = z
    .object({
        issue_type: z.string(), // The error type is represented as a string
        file_path: z.string().optional(), // File name is a string and may or may not be present
        line_number: z.number().optional(), // Line number can be a string or number and may or may not be present
        code_snippet: z.string().optional(), // Line content where the error is found is a string and optional
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
})

export function NodeStatusReason({ node_id, status_reason }: NodeVersion) {
    const { ref, inView } = useInView()
    const { data: node } = useGetNode(
        node_id!,
        {},
        { query: { enabled: inView } }
    )

    const statusReasonJson = parseJsonSafe(status_reason ?? '').data

    const issueListParseResult = zErrorArray.safeParse(
        statusReasonJson?.flatMap?.((i) => {
            // Unwind matches if present
            if (i.matches) {
                return i.matches.flatMap((match, matchIndex) =>
                    match.strings.flatMap((string) =>
                        string.instances.map((instance) => ({
                            ...i,
                            issue_type: i.issue_type || i.error_type || i.type,
                            file_path:
                                match.filepath ||
                                i.file_path ||
                                i.path ||
                                i.file ||
                                i.file_name ||
                                i.filename,
                            line_number: instance.line_number || -1,
                            code_snippet: instance.line || i.code_snippet,
                            matched_data: instance.matched_data,
                            matched_length: instance.matched_length,
                            offset: instance.offset,
                            matches: [{ ...match, strings: undefined }],
                            identifier: string.identifier,
                        }))
                    )
                )
            }
            // Default conversion for non-matching entries
            return {
                ...i,
                issue_type: i.issue_type || i.error_type || i.type,
                error_type: undefined,
                type: undefined,
                //
                file_path:
                    i.file_path ||
                    i.path ||
                    i.file ||
                    i.file_name ||
                    i.filename,
                path: undefined,
                file: undefined,
                file_name: undefined,
                filename: undefined,

                //
                line_number:
                    i.line_number ||
                    (typeof i.line === 'number' ? i.line : undefined) ||
                    -1,
                //
                code_snippet:
                    i.code_snippet ||
                    (typeof i.line === 'string' ? i.line : undefined) ||
                    i.content,

                content: undefined,
                line: undefined,
            }
        })
    )
    issueListParseResult?.error &&
        console.warn(
            'Error parsing issue list',
            issueListParseResult?.error,
            statusReasonJson
        )
    const issueList = issueListParseResult?.data
    
    const statusReason =
        zStatusReason.safeParse(statusReasonJson).data ??
        zStatusReason.parse({ message: status_reason, by: 'admin@comfy.org' })

    const fullfilledErrorList = issueList
        // guess url
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

    const problemsSummary = fullfilledErrorList
        ?.sort(
            compareBy((e) =>
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
        .map((e, i) => (
            <li
                key={i}
                className="flex gap-2 items-center w-full justify-start"
            >
                <Link href={e.url} target="_blank" className="button flex-0">
                    <FaGithub className="w-5 h-5 ml-4" />
                </Link>
                <code
                    className="flex-1 ml-4 whitespace-nowrap text-ellipsis overflow-hidden"
                    title={`${e.file_path} L${e.line_number} ${e.issue_type}\n${e.code_snippet?.trim()??''}`}
                >
                    {(e.file_path?.length ?? 0) > 12
                        ? `…${e.file_path?.slice(-10)}`
                        : e.file_path}
                    &nbsp;
                    L{e.line_number}
                    &nbsp;
                    {e.issue_type}
                    &nbsp;
                    {e.code_snippet}
                </code>
            </li>
        ))

    const code = JSON.stringify(fullfilledErrorList) ?? status_reason
    return (
        <div className="text-[18px] pt-2 text-gray-300" ref={ref}>
            {!!problemsSummary && (
                <>
                    <div>{'Problems Summary: '}</div>
                    <ol className="ml-4">{problemsSummary}</ol>
                </>
            )}

            {!!code?.trim() && (
                <details open={!problemsSummary}>
                    <summary>{'Status Reason: '}</summary>
                    <PrettieredYAML>{code}</PrettieredYAML>
                </details>
            )}
        </div>
    )
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
                <SyntaxHighlighter language="yaml" style={dark}>
                    {code}
                </SyntaxHighlighter>
            )}

            {isEditorOpen && (
                <Editor
                    className={!displayEditor ? 'hidden' : ''}
                    language="yaml"
                    options={{ readOnly: true }}
                    theme={'vs-dark'}
                    height={'30em'}
                    value={code}
                    onMount={() => setEditorReady(true)}
                />
            )}
        </div>
    )
}
