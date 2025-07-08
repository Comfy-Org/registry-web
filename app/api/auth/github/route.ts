import { NextRequest, NextResponse } from 'next/server'
import analytic from 'src/analytic/analytic'

/**
 * API endpoint for GitHub OAuth authentication
 *
 * This endpoint initiates the GitHub OAuth flow for repository verification.
 * It redirects the user to GitHub's authorization page with appropriate scopes.
 */
export const GET = async (request: NextRequest) => {
    try {
        const url = new URL(request.url)
        const redirectUri = url.searchParams.get('redirectUri')
        const owner = url.searchParams.get('owner')
        const repo = url.searchParams.get('repo')
        const nodeId = url.searchParams.get('nodeId')
        const publisherId = url.searchParams.get('publisherId')
        const customScope = url.searchParams.get('scope')

        if (!redirectUri || !owner || !repo || !nodeId || !publisherId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            )
        }

        // GitHub OAuth application credentials
        const clientId = process.env.GITHUB_CLIENT_ID

        if (!clientId) {
            return NextResponse.json(
                { error: 'GitHub OAuth not configured' },
                { status: 500 }
            )
        }

        // Log the OAuth initiation
        analytic.track('GitHub OAuth Initiated', {
            nodeId,
            publisherId,
            repository: `https://github.com/${owner}/${repo}`,
        })

        // Use custom scope if provided, otherwise use empty string

        // State parameter helps prevent CSRF attacks and can store information about the request
        const state = Buffer.from(
            JSON.stringify({
                redirectUri,
                nodeId,
                publisherId,
                repo: `${owner}/${repo}`,
                timestamp: Date.now(),
            })
        ).toString('base64')

        const frontendHost =
            process.env.VERCEL_URL // usually [branch].vercel.app or registry.comfy.org
            || request.headers.get('x-forwarded-host') // if use reverse-proxy
            || request.headers.get('host'); // fallback to request host
        const origin = `https://${frontendHost}`

        // Redirect to GitHub OAuth
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: `${origin}/api/auth/github/callback`,
            scope: customScope || '',
            state: state,
            allow_signup: 'false',
        })
        const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`

        return NextResponse.redirect(githubAuthUrl)
    } catch (error) {
        console.error('GitHub OAuth error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
