import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import sflow from 'sflow'

export function SummariseIssues({
    nodeId,
    version,
}: {
    nodeId: string
    version: string
}) {
    const api = '/api/v1/admin/summarise-issues'
    const [summary, setSummary] = useState<string>()
    const [status, setStatus] = useState<'loading' | 'error' | 'success'>()
    useEffect(() => {
        const abortController = new AbortController()
        setStatus('loading')
        fetch(api, {
            method: 'POST',
            body: JSON.stringify({ nodeId, version }),
            signal: abortController.signal,
        })
            .then(async (res) => {
                await sflow(res.body!)
                    .forEach((chunk) => {
                        const text = new TextDecoder('utf-8').decode(chunk)
                        setSummary((e) => e + text)
                    })
                    .run()
                setStatus('success')
            })
            .catch((e) => {
                setStatus('error')
            })
        return () => abortController.abort()
    }, [])

    return (
        <div className="text-[14px] pt-2 text-gray-300 ">
            <h4>{'Problems AI Summary: '}</h4>
            <Markdown>{summary}</Markdown>
        </div>
    )
}
