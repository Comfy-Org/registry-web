import { NextRequest, NextResponse } from 'next/server'

/**
 * Example: Delayed notification workflow
 * Demonstrates sending a notification after a delay (e.g., welcome email after signup)
 *
 * Note: The sleep() function will be available in future versions of Vercel Workflow.
 * This example demonstrates the workflow pattern without actual delays.
 *
 * Test with:
 * curl -X POST http://localhost:3000/api/workflow-notification-example \
 *   -H "Content-Type: application/json" \
 *   -d '{"userId": "user123", "email": "user@example.com", "name": "John"}'
 */
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { userId, email, name } = body

    if (!userId || !email || !name) {
      return NextResponse.json(
        { error: 'userId, email, and name are required' },
        { status: 400 }
      )
    }

    const result = await welcomeNotificationWorkflow(userId, email, name)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Notification workflow error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * Welcome notification workflow with delayed follow-up
 */
async function welcomeNotificationWorkflow(
  userId: string,
  email: string,
  name: string
) {
  'use workflow'

  try {
    // Step 1: Send immediate welcome notification
    const welcomeResult = await sendWelcomeNotification(userId, email, name)

    // Step 2: Send follow-up notification
    // Note: In production, use sleep() here for delayed follow-ups:
    // await sleep('1 day') // Will be available in future workflow versions
    const followUpResult = await sendFollowUpNotification(userId, email, name)

    return {
      success: true,
      userId,
      welcome: welcomeResult,
      followUp: followUpResult,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Notification workflow failed:', error)
    return {
      success: false,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Send immediate welcome notification
 * Steps automatically retry on failure with exponential backoff
 */
async function sendWelcomeNotification(
  userId: string,
  email: string,
  name: string
) {
  'use step'

  try {
    // Simulate sending email or notification
    // In production, this would call an actual email service API
    const notification = {
      to: email,
      subject: `Welcome, ${name}!`,
      body: 'Thank you for joining our ComfyUI registry!',
      sentAt: new Date().toISOString(),
    }

    console.log('Sending welcome notification:', notification)
    return { success: true, ...notification }
  } catch (error) {
    console.error('Failed to send welcome notification:', error)
    // Re-throw to trigger automatic retry
    throw error
  }
}

/**
 * Send follow-up notification after delay
 * Steps automatically retry on failure with exponential backoff
 */
async function sendFollowUpNotification(
  userId: string,
  email: string,
  name: string
) {
  'use step'

  try {
    // Simulate sending follow-up email
    // In production, this would call an actual email service API
    const notification = {
      to: email,
      subject: `${name}, explore more custom nodes!`,
      body: 'Discover the latest ComfyUI custom nodes in our registry.',
      sentAt: new Date().toISOString(),
    }

    console.log('Sending follow-up notification:', notification)
    return { success: true, ...notification }
  } catch (error) {
    console.error('Failed to send follow-up notification:', error)
    // Re-throw to trigger automatic retry
    throw error
  }
}
