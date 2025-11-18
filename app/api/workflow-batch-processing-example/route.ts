import { NextRequest, NextResponse } from 'next/server'

/**
 * Note: sleep() will be available when Vercel Workflow exports it in future versions.
 * For now, this example demonstrates the workflow pattern without actual delays.
 */

/**
 * Example: Batch processing workflow with rate limiting
 * Demonstrates processing multiple items with delays to avoid rate limits
 */
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { items } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items array is required and must not be empty' },
        { status: 400 }
      )
    }

    const result = await batchProcessingWorkflow(items)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Batch processing workflow error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * Batch processing workflow with rate limiting
 * Useful for processing nodes, updating indices, or syncing data
 */
async function batchProcessingWorkflow(items: string[]) {
  'use workflow'

  const results = []
  const batchSize = 5

  // Process items in batches
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)

    // Process current batch
    const batchResults = await processBatch(batch, i / batchSize + 1)
    results.push(...batchResults)

    // Note: sleep() would be used here for rate limiting in production
    // if (i + batchSize < items.length) {
    //   await sleep('3 seconds') // Adjust for rate limits
    // }
  }

  // Generate final summary
  const summary = await generateBatchSummary(results)

  return {
    totalItems: items.length,
    processedItems: results.length,
    results,
    summary,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Process a batch of items
 */
async function processBatch(batch: string[], batchNumber: number) {
  'use step'

  console.log(`Processing batch ${batchNumber} with ${batch.length} items`)

  // Simulate processing each item
  const results = batch.map((item, index) => ({
    item,
    batchNumber,
    indexInBatch: index,
    processed: true,
    processedAt: new Date().toISOString(),
  }))

  return results
}

/**
 * Generate summary of batch processing results
 */
async function generateBatchSummary(results: any[]) {
  'use step'

  const successCount = results.filter((r) => r.processed).length
  const failureCount = results.length - successCount

  return {
    total: results.length,
    successful: successCount,
    failed: failureCount,
    successRate: (successCount / results.length) * 100,
  }
}
