import { listNodeVersions } from '@/src/api/generated'
import { notFound } from 'next/navigation'
import OpenAI from 'openai'
import sflow from 'sflow'
import { z } from 'zod'
export const GET = handler
export const POST = handler

async function handler(req: Request) {
    const { nodeId, version } = z
        .object({
            nodeId: z.string(),
            version: z.string(),
        })
        .parse({
            ...Object.fromEntries(new URL(req.url).searchParams.entries()),
            ...(req.method === 'POST' ? await req.json() : {}),
        })

    const list = await listNodeVersions(nodeId, { include_status_reason: true })

    const nv = list.find((e) => e.version === version) ?? notFound()

    const issuesStr = nv.status_reason

    // response markdown text in stream
    return sflow(
        new OpenAI().chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: `Summarise the following issues in a table format with the following columns: ID, Title, Description
                and Status. The table should be in markdown format. Here are the issues: ${issuesStr}`,
                },
                {
                    role: 'assistant',
                    content: ``,
                },
            ],
        })
    ).map((e) => e.choices?.[0]?.message?.content ?? '')
}
