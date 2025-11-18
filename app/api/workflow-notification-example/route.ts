import { NextRequest, NextResponse } from 'next/server'

/**
 * Note: sleep() will be available when Vercel Workflow exports it in future versions.
 * For now, this example demonstrates the workflow pattern without actual delays.
 */

/**
 * Example: Delayed notification workflow
 * Demonstrates sending a notification after a delay (e.g., welcome email after signup)
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
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
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

  // Step 1: Send immediate welcome notification
  const welcomeResult = await sendWelcomeNotification(userId, email, name)

  // Note: sleep() would be used here for delays in production
  // await sleep('1 day') // Wait 1 day before sending follow-up
  // For now, follow-up is sent immediately due to sleep() not being exported yet

  // Step 2: Send follow-up notification
  const followUpResult = await sendFollowUpNotification(userId, email, name)

  return {
    userId,
    welcome: welcomeResult,
    followUp: followUpResult,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Send immediate welcome notification
 */
async function sendWelcomeNotification(
  userId: string,
  email: string,
  name: string
) {
  'use step'

  // Simulate sending email or notification
  const notification = {
    to: email,
    subject: `Welcome, ${name}!`,
    body: 'Thank you for joining our ComfyUI registry!',
    sentAt: new Date().toISOString(),
  }

  console.log('Sending welcome notification:', notification)
  return { success: true, ...notification }
}

/**
 * Send follow-up notification after delay
 */
async function sendFollowUpNotification(
  userId: string,
  email: string,
  name: string
) {
  'use step'

  // Simulate sending follow-up email
  const notification = {
    to: email,
    subject: `${name}, explore more custom nodes!`,
    body: 'Discover the latest ComfyUI custom nodes in our registry.',
    sentAt: new Date().toISOString(),
  }

  console.log('Sending follow-up notification:', notification)
  return { success: true, ...notification }
}
