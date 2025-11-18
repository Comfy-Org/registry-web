import { NextRequest, NextResponse } from 'next/server'

/**
 * Example Vercel Workflow API route using App Router
 * Demonstrates the use of 'use workflow' and 'use step' directives
 *
 * Note: sleep() function is available in Vercel Workflow but not yet exported
 * in the current beta version (4.0.1-beta.3). It will be available in future versions.
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
 * Example workflow function that demonstrates durability
 * This function can be paused and resumed across deployments
 */
async function exampleWorkflow(topic: string) {
  'use workflow'

  // Step 1: Process the topic
  const processed = await processStep(topic)

  // Step 2: Generate summary
  // Note: sleep() would normally be used here for delays
  //  e.g., await sleep('2 seconds') or await sleep('1 day')
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
