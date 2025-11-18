import { NextRequest, NextResponse } from 'next/server'

/**
 * Example: Multi-step approval workflow with retry logic
 * Demonstrates a node submission approval process with timeout
 *
 * Note: The sleep() function will be available in future versions of Vercel Workflow.
 * This example demonstrates the workflow pattern without actual delays.
 *
 * Test with:
 * curl -X POST http://localhost:3000/api/workflow-approval-example \
 *   -H "Content-Type: application/json" \
 *   -d '{"nodeId": "node123", "submitterId": "user456", "nodeName": "My Custom Node"}'
 */
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { nodeId, submitterId, nodeName } = body

    if (!nodeId || !submitterId || !nodeName) {
      return NextResponse.json(
        { error: 'nodeId, submitterId, and nodeName are required' },
        { status: 400 }
      )
    }

    const result = await nodeApprovalWorkflow(nodeId, submitterId, nodeName)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Approval workflow error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * Node submission approval workflow
 * Demonstrates multi-step process with automated checks and human approval
 */
async function nodeApprovalWorkflow(
  nodeId: string,
  submitterId: string,
  nodeName: string
) {
  'use workflow'

  try {
    // Step 1: Run automated validation checks
    const validationResult = await runAutomatedValidation(nodeId, nodeName)

    if (!validationResult.passed) {
      return {
        success: false,
        nodeId,
        status: 'rejected',
        reason: 'Failed automated validation',
        validationResult,
        timestamp: new Date().toISOString(),
      }
    }

    // Step 2: Notify admin for manual review
    await notifyAdminForReview(nodeId, submitterId, nodeName)

    // Step 3: Check approval status (simulated)
    // Note: In production, use sleep() here to wait for admin review:
    // await sleep('24 hours') // Will be available in future workflow versions
    // Can be combined with webhook/hook to resume workflow on admin action
    const approvalResult = await checkApprovalStatus(nodeId)

    // Step 4: Update node status based on approval
    const finalResult = await updateNodeStatus(nodeId, approvalResult.approved)

    return {
      success: true,
      nodeId,
      nodeName,
      status: approvalResult.approved ? 'approved' : 'rejected',
      validationResult,
      approvalResult,
      finalResult,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Approval workflow failed:', error)
    return {
      success: false,
      nodeId,
      nodeName,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Run automated validation checks on the submitted node
 * Steps automatically retry on failure with exponential backoff
 */
async function runAutomatedValidation(nodeId: string, nodeName: string) {
  'use step'

  try {
    // Simulate validation checks
    // In production, these would be actual API calls or file validations
    const checks = {
      hasValidName: nodeName.length > 0 && nodeName.length < 100,
      hasValidFormat: true, // Would check file format
      passesSecurityScan: true, // Would run security checks
    }

    const passed = Object.values(checks).every((check) => check === true)

    return {
      passed,
      checks,
      checkedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Validation failed:', error)
    // Re-throw to trigger automatic retry
    throw error
  }
}

/**
 * Notify admin that a node needs manual review
 */
async function notifyAdminForReview(
  nodeId: string,
  submitterId: string,
  nodeName: string
) {
  'use step'

  const notification = {
    recipient: 'admin',
    subject: 'New node pending approval',
    body: `Node "${nodeName}" (ID: ${nodeId}) submitted by ${submitterId} needs review`,
    sentAt: new Date().toISOString(),
  }

  console.log('Admin notification sent:', notification)
  return notification
}

/**
 * Check the approval status (simulated)
 * In production, this would query a database or state store
 */
async function checkApprovalStatus(nodeId: string) {
  'use step'

  // Simulate checking approval status
  // In real implementation, this would check actual admin decision
  return {
    approved: Math.random() > 0.3, // 70% approval rate for demo
    reviewedBy: 'admin@example.com',
    reviewedAt: new Date().toISOString(),
  }
}

/**
 * Update the node status in the database
 */
async function updateNodeStatus(nodeId: string, approved: boolean) {
  'use step'

  const status = approved ? 'published' : 'rejected'

  console.log(`Updating node ${nodeId} status to: ${status}`)

  return {
    nodeId,
    status,
    updatedAt: new Date().toISOString(),
  }
}
