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
import { MdEdit } from 'react-icons/md'
import { useInView } from 'react-intersection-observer'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { NodeVersion, useGetNode } from 'src/api/generated'
import yaml from 'yaml'
import { z } from 'zod'

// schema reference from (private): https://github.com/Comfy-Org/security-scanner
const errorArraySchema = z
    .object({
        error_type: z.string(), // The error type is represented as a string
        file_name: z.string().optional(), // File name is a string and may or may not be present
        line_number: z.union([z.string(), z.number()]).optional(), // Line number can be a string or number and may or may not be present
        line: z.string().optional(), // Line content where the error is found is a string and optional
        scanner: z.string().optional(), // Scanner name is a string and optional
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
        //     .optional(), // Meta information is optional and contains a detailed description if present
        // matches: z
        //     .array(
        //         z.object({
        //             filepath: z.string(),
        //             strings: z.array(
        //                 z.object({
        //                     identifier: z.string(),
        //                     instances: z.array(
        //                         z.object({
        //                             matched_data: z.string(),
        //                             matched_length: z.number(),
        //                             offset: z.number(),
        //                             line_number: z.number(),
        //                             line: z.string(),
        //                         })
        //                     ),
        //                 })
        //             ),
        //         })
        //     )
        //     .optional(), // Matches array, if present, contains detailed match information
    })
    .passthrough()
    .array()

export function NodeStatusReason({ node_id, status_reason }: NodeVersion) {
    const { ref, inView } = useInView()
    const { data: node } = useGetNode(node_id!, { query: { enabled: inView } })

    const reasonJson = (function () {
        try {
            return JSON.parse(status_reason ?? '')
        } catch (e) {
            console.error('Warning: fail to parse status reason: ', {
                status_reason,
            })
            console.error(e)
            return null
        }
    })()
    const errorList = errorArraySchema.safeParse(reasonJson).data

    const fullfilledErrorList = errorList
        // guess url
        ?.map((e) => {
            const repoUrl = node?.repository || ''
            const filepath =
                repoUrl &&
                (e.file_name || '') &&
                `/blob/HEAD/${e.file_name?.replace(/^\//, '')}`
            const linenumber =
                filepath && (e.line_number || '') && `#L${e.line_number}`
            const url = reopUrl + filepath + linenumber
            return { ...e, url }
        })

    const problemsSummary = fullfilledErrorList
        ?.sort(compareBy((e) => e.url ?? ''))
        .map((e, i) => (
            <li key={i}>
                <Link href={e.url} passHref className="button">
                    <a>
                        <code className="block">{e.url}</code>
                        <code className="ml-4">{e.error_type}</code>
                        <code className="ml-4">{e.line}</code>
                    </a>
                </Link>
            </li>
        ))
    // const renderErrorList = fullfilledErrorList?.map((error, i) => {
    //     return (
    //         <div key={i}>
    //             <span className="m-1">{error.file_name}</span>
    //             <span className="m-1">{error.line}</span>
    //             <span className="m-1">{error.error_type}</span>
    //             <span className="m-1">{error.scanner}</span>
    //             <>Meta: {JSON.stringify(error.meta, null, 2)}</>

    //             <Link href={url} passHref className="btn">
    //                 <a>Check REPO</a>
    //             </Link>
    //             {/* todo: maybe suggest a change and pr in future */}
    //         </div>
    //     )
    // })

    const code = JSON.stringify(fullfilledErrorList) ?? status_reason
    return (
        <div className="text-[18px] pt-2 text-gray-300" ref={ref}>
            {/* {renderErrorList || (
                <>{!!code && <PrettieredJSON5>{code}</PrettieredJSON5>}</>
                )} */}
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
        <SyntaxHighlighter language="yaml" style={dark}>
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
