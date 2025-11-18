import { NextRequest, NextResponse } from 'next/server'
import { sleep } from 'workflow'

/**
 * Example Vercel Workflow API route using App Router
 * Demonstrates the use of 'use workflow' and 'use step' directives
 */
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { topic } = body

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    const result = await exampleWorkflow(topic)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Workflow error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * Example workflow function that demonstrates durability with sleep
 * This function can be paused and resumed across deployments
 */
async function exampleWorkflow(topic: string) {
  'use workflow'

  // Step 1: Process the topic
  const processed = await processStep(topic)

  // Pause for 2 seconds to demonstrate sleep() functionality
  // In production, you might use longer durations like "1 day" or "7 days"
  await sleep('2 seconds')

  // Step 2: Generate summary after the delay
  const summary = await summarizeStep(processed)

  return {
    topic,
    processed,
    summary,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Stateless step function with automatic retries
 * Ideal for external API calls or isolated operations
 */
async function processStep(input: string) {
  'use step'

  // Simulate processing
  return {
    original: input,
    processed: input.toUpperCase(),
    length: input.length,
  }
}

/**
 * Another step function for summarization
 */
async function summarizeStep(data: {
  original: string
  processed: string
  length: number
}) {
  'use step'

  return `Processed "${data.original}" (${data.length} chars) to "${data.processed}"`
}
