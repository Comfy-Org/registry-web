import { NextRequest, NextResponse } from 'next/server'
import analytic from 'src/analytic/analytic'

/**
 * GitHub OAuth callback handler
 *
 * This endpoint handles the callback from GitHub OAuth.
 * It exchanges the code for an access token and verifies repository ownership.
 */
export const GET = async (request: NextRequest) => {
    try {
        const url = new URL(request.url)
        const code = url.searchParams.get('code')
        const state = url.searchParams.get('state')

        if (!code || !state) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            )
        }

        // GitHub OAuth application credentials
        const clientId = process.env.GITHUB_CLIENT_ID
        const clientSecret = process.env.GITHUB_CLIENT_SECRET

        if (!clientId || !clientSecret) {
            return NextResponse.json(
                { error: 'GitHub OAuth not configured' },
                { status: 500 }
            )
        }

        // Decode state parameter to get original request data
        let stateData
        try {
            stateData = JSON.parse(Buffer.from(state, 'base64').toString())
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid state parameter' },
                { status: 400 }
            )
        }

        const { redirectUri, nodeId, publisherId, repo } = stateData

        if (!redirectUri || !nodeId || !publisherId || !repo) {
            return NextResponse.json(
                { error: 'Invalid state parameter data' },
                { status: 400 }
            )
        }

        // Exchange code for access token
        const tokenResponse = await fetch(
            'https://github.com/login/oauth/access_token',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                }),
            }
        )

        const tokenData = await tokenResponse.json()
        const accessToken = tokenData.access_token

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Failed to obtain access token' },
                { status: 400 }
            )
        }

        // Verify repository ownership
        const [owner, repoName] = repo.split('/')

        const repoResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repoName}`,
            {
                headers: {
                    Authorization: `token ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            }
        )

        if (!repoResponse.ok) {
            // If the user doesn't have access to the repository, GitHub API will return 404
            analytic.track('GitHub Verification Failed', {
                nodeId,
                publisherId,
                error: 'User does not have access to repository',
            })

            // Check if redirectUri already contains search parameters
            const separator = redirectUri.includes('?') ? '&' : '?'
            return NextResponse.redirect(
                `${redirectUri}${separator}error=repository_access_denied`
            )
        }

        // Repository verification successful
        analytic.track('GitHub Verification Success', {
            nodeId,
            publisherId,
        })

        // Redirect back to the application with the token
        // Check if redirectUri already contains search parameters
        const separator = redirectUri.includes('?') ? '&' : '?'
        return NextResponse.redirect(
            `${redirectUri}${separator}token=${encodeURIComponent(accessToken)}`
        )
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
