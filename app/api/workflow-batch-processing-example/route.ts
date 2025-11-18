import { NextRequest, NextResponse } from 'next/server'
import { sleep } from 'workflow'

/**
 * Example: Batch processing workflow with rate limiting
 * Demonstrates processing multiple items with delays to avoid rate limits
 *
 * Test with:
 * curl -X POST http://localhost:3000/api/workflow-batch-processing-example \
 *   -H "Content-Type: application/json" \
 *   -d '{"items": ["item1", "item2", "item3", "item4", "item5"]}'
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
    const errorMessage =
      error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * Batch processing workflow with rate limiting
 * Useful for processing nodes, updating indices, or syncing data
 */
async function batchProcessingWorkflow(items: string[]) {
  'use workflow'

  try {
    const results: Array<{
      item: string
      batchNumber: number
      indexInBatch: number
      processed: boolean
      processedAt: string
    }> = []
    const batchSize = 5

    // Process items in batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      const batchNumber = Math.floor(i / batchSize) + 1

      // Process current batch
      const batchResults = await processBatch(batch, batchNumber)
      results.push(...batchResults)

      // Rate limiting: sleep between batches (durable sleep)
      // Adjust delay based on API rate limits
      if (i + batchSize < items.length) {
        await sleep('3 seconds')
      }
    }

    // Generate final summary
    const summary = await generateBatchSummary(results)

    return {
      success: true,
      totalItems: items.length,
      processedItems: results.length,
      results,
      summary,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Batch processing workflow failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Process a batch of items
 * Steps automatically retry on failure with exponential backoff
 */
async function processBatch(batch: string[], batchNumber: number) {
  'use step'

  try {
    console.log(`Processing batch ${batchNumber} with ${batch.length} items`)

    // Simulate processing each item
    // In production, this would be actual API calls (e.g., Algolia index updates)
    const results = batch.map((item, index) => ({
      item,
      batchNumber,
      indexInBatch: index,
      processed: true,
      processedAt: new Date().toISOString(),
    }))

    return results
  } catch (error) {
    console.error(`Batch ${batchNumber} processing failed:`, error)
    // Re-throw to trigger automatic retry
    throw error
  }
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
