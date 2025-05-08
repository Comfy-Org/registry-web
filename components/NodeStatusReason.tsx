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
import { HiLink } from 'react-icons/hi'
import { MdEdit } from 'react-icons/md'
import { useInView } from 'react-intersection-observer'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { NodeVersion, NodeVersionStatus, useGetNode } from 'src/api/generated'
import yaml from 'yaml'
import { z } from 'zod'
import { parseJsonSafe } from './parseJsonSafe'

// schema reference from (private): https://github.com/Comfy-Org/security-scanner
const zErrorArray = z
    .object({
        issue_type: z.string(), // The error type is represented as a string
        file_path: z.string().optional(), // File name is a string and may or may not be present
        line_number: z.number().optional(), // Line number can be a string or number and may or may not be present
        code_snippet: z.string().optional(), // Line content where the error is found is a string and optional
        scanner: z.string().optional(), // Scanner name is a string and optional
        // yara meta
        meta: z
            .object({
                description: z.string(),
                version: z.string(),
                date: z.string(),
                reference: z.string(),
                category: z.string(),
                observable_refs: z.string(),
                attack_id1: z.string(),
                attack_id2: z.string(),
                severity: z.string(),
            })
            .passthrough()
            .optional(), // Meta information is optional and contains a detailed description if present
        // yara matches
        matches: z
            .array(
                z
                    .object({
                        filepath: z.string(),
                        strings: z.array(
                            z.object({
                                identifier: z.string(),
                                instances: z.array(
                                    z.object({
                                        matched_data: z.string(),
                                        matched_length: z.number(),
                                        offset: z.number(),
                                        line_number: z.number(),
                                        line: z.string(),
                                    })
                                ),
                            })
                        ),
                    })
                    .passthrough()
                    .optional()
            )
            .optional(), // Matches array, if present, contains detailed match information
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

    const issueList = zErrorArray.safeParse(
        statusReasonJson?.map?.((e) => ({
            // try convert status reason to latest schema
            ...e,
            issue_type: e.issue_type || e.error_type || e.type,
            file_path: e.file_path || e.filename || e.path || e.file,
            line_number:
                e.line_number ||
                (typeof e.line === 'number' ? e.line : undefined) ||
                -1,
            code_snippet:
                e.code_snippet ||
                (typeof e.line === 'string' ? e.line : undefined) ||
                e.content,
        }))
    ).data

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
        ?.sort(compareBy((e) => e.url ?? e.file_path))
        .map((e, i) => (
            <li key={i}>
                <Link href={e.url} passHref className="button" legacyBehavior>
                    <a className="flex gap-2">
                        <HiLink className="w-5 h-5 ml-4" />
                        <code className="ml-4">{e.issue_type}</code>
                        <code className="ml-4">{e.line_number}</code>
                        <code className="ml-4">{e.code_snippet}</code>
                    </a>
                </Link>
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
            <div>{'Status Reason: '}</div>
            {!!code && <PrettieredYAML>{code}</PrettieredYAML>}
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
