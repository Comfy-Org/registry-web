import { NextRequest, NextResponse } from 'next/server'
import { DIE } from 'phpdie'
import analytic from 'src/analytic/analytic'

// Ensure environment variables are set for vercel production env
if (process.env.VERCEL_URL && process.env.NODE_ENV === 'production') {
    process.env.GITHUB_CLIENT_ID || DIE('GITHUB_CLIENT_ID is not set')
    process.env.GITHUB_CLIENT_SECRET || DIE('GITHUB_CLIENT_SECRET is not set')
}

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

        // - [System environment variables](https://vercel.com/docs/environment-variables/system-environment-variables )
        const xfh =
            request.headers.get('x-forwarded-host') || // if use reverse-proxy, e.g. caddy/nginx/vercel
            request.headers.get('host') // fallback to request host
        const xfp = request.headers.get('x-forwarded-proto') || 'http'
        const origin = `${xfp}://${xfh}`

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
