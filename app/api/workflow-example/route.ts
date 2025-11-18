import { NextRequest, NextResponse } from 'next/server'

/**
 * Example Vercel Workflow API route using App Router
 * Demonstrates the use of 'use workflow' and 'use step' directives with proper error handling
 *
 * Note: The sleep() function will be available in future versions of Vercel Workflow.
 * This example demonstrates the workflow pattern without actual delays.
 *
 * Test with:
 * curl -X POST http://localhost:3000/api/workflow-example \
 *   -H "Content-Type: application/json" \
 *   -d '{"topic": "test workflow"}'
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
    const errorMessage =
      error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * Example workflow function that demonstrates durability
 * This function can be paused and resumed across deployments
 */
async function exampleWorkflow(topic: string) {
  'use workflow'

  try {
    // Step 1: Process the topic
    const processed = await processStep(topic)

    // Step 2: Generate summary
    // Note: In production, use sleep() here for delays:
    // await sleep('2 seconds') // Will be available in future workflow versions
    const summary = await summarizeStep(processed)

    return {
      success: true,
      topic,
      processed,
      summary,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    // Workflow-level error handling
    console.error('Workflow failed:', error)
    return {
      success: false,
      topic,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Stateless step function with automatic retries
 * Ideal for external API calls or isolated operations
 * Steps automatically retry on unhandled errors with exponential backoff
 */
async function processStep(input: string) {
  'use step'

  try {
    // Simulate processing that might fail
    if (input.toLowerCase().includes('error')) {
      throw new Error('Processing failed: input contains error keyword')
    }

    return {
      original: input,
      processed: input.toUpperCase(),
      length: input.length,
    }
  } catch (error) {
    // Re-throw to trigger automatic retry
    console.error('Process step failed:', error)
    throw error
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
