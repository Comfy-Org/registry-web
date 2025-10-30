import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * Example Vercel Workflow API route
 * Demonstrates the use of 'use workflow' and 'use step' directives
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { topic } = req.body

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' })
  }

  const result = await exampleWorkflow(topic)
  res.status(200).json(result)
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
