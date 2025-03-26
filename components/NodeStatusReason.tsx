// import jsonFormat from 'json-stringify-pretty-compact'
import Link from 'next/link'
import prettierPluginBabel from 'prettier/plugins/babel'
import prettierPluginEstree from 'prettier/plugins/estree'
import prettierPluginYaml from 'prettier/plugins/yaml'
import { format } from 'prettier/standalone'
import { tryCatch } from 'rambda'
import { useEffect, useState } from 'react'
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

    const renderErrorList = errorList?.map((error, i) => {
        const repo = node?.repository || ''
        const fn =
            repo && (error.file_name || '') && `/blob/HEAD/${error.file_name}`
        const ln = fn && (error.line_number || '') && `#L${error.line_number}`
        const guessLocation = repo + fn + ln

        return (
            <div key={i}>
                <span className="m-1">{error.file_name}</span>
                <span className="m-1">{error.line}</span>

                <span className="m-1">{error.error_type}</span>
                <span className="m-1">{error.scanner}</span>

                <>Meta: {JSON.stringify(error.meta, null, 2)}</>

                <Link href={guessLocation} passHref className="btn">
                    <a>Check REPO</a>
                </Link>
                {/* todo: maybe suggest a change and pr in future */}
            </div>
        )
    })

    const [code, setCode] = useState(status_reason ?? '')
    useEffect(() => {
        format(status_reason ?? '', {
            parser: 'json5',
            plugins: [prettierPluginBabel, prettierPluginEstree],
        }).then(setCode)
    }, [status_reason])

    return (
        <p className="text-[18px] pt-2 text-gray-300" ref={ref}>
            {'Status Reason: '}
            {/* {renderErrorList || (
                <>{!!code && <PrettieredJSON5>{code}</PrettieredJSON5>}</>
            )} */}
            {!!code && <PrettieredYAML>{code}</PrettieredYAML>}
        </p>
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
    return (
        <SyntaxHighlighter language="yaml" style={dark}>
            {code}
        </SyntaxHighlighter>
    )
}
