/**
 * Claim My Node Page
 * This page allows a publisher to claim ownership of an unclaimed node by verifying
 * their ownership of the GitHub repository.
 *
 * @author: snomiao <snomiao@gmail.com>
 */
import withAuth from '@/components/common/HOC/withAuth'
import {
    GithubUserSpan,
    NodeSpan,
    PublisherSpan,
} from '@/components/common/Spans'
import { useNextTranslation } from '@/src/hooks/i18n'
import { Alert, Button, Spinner } from 'flowbite-react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Octokit } from 'octokit'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import analytic from 'src/analytic/analytic'
import {
    useClaimMyNode,
    useGetNode,
    useGetPublisher,
    useGetUser,
} from 'src/api/generated'
import { UNCLAIMED_ADMIN_PUBLISHER_ID } from 'src/constants'

// Define the possible stages of the claim process
type ClaimStage =
    | 'info_confirmation'
    | 'github_login'
    | 'verifying_admin'
    | 'claim_node'
    | 'completed'

function ClaimMyNodePage() {
    const { t } = useNextTranslation()
    const router = useRouter()
    const { publisherId, nodeId } = router.query
    const [currentStage, setCurrentStage] =
        useState<ClaimStage>('info_confirmation')
    const [isVerifying, setIsVerifying] = useState(false)
    const [isVerified, setIsVerified] = useState(false)
    const [githubToken, setGithubToken] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [permissionCheckLoading, setPermissionCheckLoading] = useState(false)
    const [githubUsername, setGithubUsername] = useState<string>('unknown')
    const [githubUserId, setGithubUserId] = useState<string>('unknown')

    // Get the node, claiming publisher, and current user
    const { data: node, isLoading: nodeLoading } = useGetNode(
        nodeId as string,
        {},
        { query: { enabled: !!nodeId } }
    )
    const { data: publisherToClaim, isLoading: publisherLoading } =
        useGetPublisher(publisherId as string, {
            query: { enabled: !!publisherId },
        })
    const { data: user, isLoading: userLoading } = useGetUser()

    // Mutation for claiming the node using the generated API hook
    const { mutate: claimNode, isPending: isClaimingNode } = useClaimMyNode({
        mutation: {
            onSuccess: () => {
                toast.success(t('Node claimed successfully!'))
                analytic.track('Node Claimed', {
                    nodeId,
                    publisherId,
                })
                // Set stage to completed
                setCurrentStage('completed')
            },
            onError: (error: any) => {
                toast.error(
                    error?.message ||
                        t('Failed to claim node. Please try again.')
                )
                setError(
                    t(
                        'Unable to claim the node. Please verify your GitHub repository ownership and try again.'
                    )
                )
            },
        },
    })

    const isLoading = nodeLoading || publisherLoading || userLoading

    // Function to check if the user has admin access to the repository
    const verifyRepoPermissions = async (
        token: string,
        owner: string,
        repo: string
    ) => {
        try {
            setPermissionCheckLoading(true)

            // Initialize Octokit with the user's token
            const octokit = new Octokit({
                auth: token,
            })

            // Get GitHub user info first using Octokit REST API
            try {
                const { data: userData } =
                    await octokit.rest.users.getAuthenticated()
                setGithubUsername(userData.login)
                setGithubUserId(userData.id.toString())
            } catch (error) {
                // If we can't get user data, we can't proceed with verification
                return false
            }

            // Check repository access
            try {
                // This will throw an error if the repository doesn't exist or user doesn't have access
                const { data: repoData } = await octokit.rest.repos.get({
                    owner,
                    repo,
                })

                // If permissions is included and shows admin access, we have admin permission
                if (repoData.permissions?.admin === true) {
                    return true
                }

                // If we have basic access but need to verify specific permission level
                try {
                    // Check collaborator permission level
                    const { data: permissionData } =
                        await octokit.rest.repos.getCollaboratorPermissionLevel(
                            {
                                owner,
                                repo,
                                username: githubUsername,
                            }
                        )

                    // Check if user has admin permission level
                    const permission = permissionData.permission
                    if (permission === 'admin') {
                        return true
                    }
                } catch (permissionError) {
                    // If we can't check specific permissions, we'll assume no admin access
                    return false
                }

                // If we've reached here without a definitive answer, be conservative
                return false
            } catch (repoError) {
                // Repository not found or user doesn't have access
                return false
            }
        } catch (err: any) {
            // Instead of throwing an error, return false to indicate no permissions
            // This makes the verification process more resilient
            return false
        } finally {
            setPermissionCheckLoading(false)
        }
    }

    useEffect(() => {
        // Initialize GitHub OAuth if node and publisher data is loaded
        if (!node || !publisherToClaim || !user) return

        // Check if the node is available for claiming
        if (node.publisher?.id !== UNCLAIMED_ADMIN_PUBLISHER_ID) {
            setError(
                t('This node is already claimed and cannot be claimed again.')
            )
            return
        }

        // Check if we have a nodeId in the query params
        const nodeIdParam =
            (router.query.nodeId as string) || (nodeId as string)
        if (!nodeIdParam) {
            setError(t('Node ID is required for claiming.'))
            return
        }

        // Get repository info from the node
        const repoUrl = node.repository
        if (!repoUrl) {
            setError(t('This node does not have a repository URL.'))
            return
        }

        // Extract GitHub owner and repo from URL
        // For example: https://github.com/owner/repo
        const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        if (!repoMatch) {
            setError(t('Invalid GitHub repository URL format.'))
            return
        }

        const [, owner, repo] = repoMatch

        // Check for GitHub token in the URL (OAuth callback)
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')

        if (token) {
            // If token is in URL, we've completed OAuth flow
            setGithubToken(token)

            // Update to verification stage
            setCurrentStage('verifying_admin')

            // Verify repository permissions with the token
            setIsVerifying(true)
            verifyRepoPermissions(token, owner, repo)
                .then((hasPermission) => {
                    if (hasPermission) {
                        setIsVerified(true)
                        setCurrentStage('claim_node')
                        analytic.track('GitHub Verification Success', {
                            nodeId: nodeIdParam,
                            publisherId,
                            githubUsername,
                            githubUserId,
                            hasAdminPermission: true,
                        })
                    } else {
                        const errorMsg = `You (GitHub user: ${githubUsername}, ID: ${githubUserId}) do not have admin permission to this repository (${owner}/${repo}, Node ID: ${nodeIdParam}). Only repository administrators can claim nodes.`
                        setError(errorMsg)
                        analytic.track('GitHub Verification Failed', {
                            nodeId: nodeIdParam,
                            publisherId,
                            githubUsername,
                            githubUserId,
                            reason: 'No admin permission',
                        })
                    }
                })
                .catch((err) => {
                    // This should rarely happen now since we return false for most errors
                    // But just in case there's an unexpected error
                    const errorMsg =
                        'There was an unexpected error verifying your repository permissions. Please try again.'
                    setError(errorMsg)
                    analytic.track('GitHub Verification Error', {
                        nodeId: nodeIdParam,
                        publisherId,
                        reason: err.message,
                    })
                })
                .finally(() => {
                    setIsVerifying(false)
                })

            // Clean up URL by removing only the token parameter while preserving other query params
            urlParams.delete('token')
            const newSearch = urlParams.toString()
            const newUrl =
                window.location.pathname + (newSearch ? `?${newSearch}` : '')
            router.replace(newUrl, undefined, { shallow: true })
        }
    }, [
        node,
        publisherToClaim,
        user,
        nodeId,
        publisherId,
        router.query,
        githubUsername,
        githubUserId,
    ])

    const initiateGitHubOAuth = () => {
        if (!node || !publisherId || !nodeId) return

        setIsVerifying(true)
        setCurrentStage('github_login')

        // Extract repo information
        const repoUrl = node.repository
        const repoMatch = repoUrl!.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        if (!repoMatch) {
            setError('Invalid GitHub repository URL format.')
            setIsVerifying(false)
            return
        }

        const [, owner, repo] = repoMatch

        // Construct the GitHub OAuth URL
        const redirectUri = encodeURIComponent(window.location.href)
        const githubOAuthUrl = `/api/auth/github?redirectUri=${redirectUri}&owner=${owner}&repo=${repo}&nodeId=${nodeId}&publisherId=${publisherId}`

        // Redirect to GitHub OAuth
        window.location.href = githubOAuthUrl

        analytic.track('GitHub OAuth Initiated', {
            nodeId,
            publisherId,
            repository: repoUrl,
        })
    }

    const handleClaimNode = () => {
        if (!isVerified || !githubToken) {
            toast.error(
                t('GitHub verification is required before claiming the node.')
            )
            return
        }

        const nodeIdParam =
            (router.query.nodeId as string) || (nodeId as string)
        if (!nodeIdParam) {
            toast.error(t('Node ID is required for claiming.'))
            return
        }

        // Call the mutation function with the required parameters
        claimNode({
            publisherId: publisherId as string,
            nodeId: nodeIdParam,
            data: { GH_TOKEN: githubToken },
        })
    }

    const handleGoBack = () => {
        router.push(`/nodes/${nodeId}`)
    }

    const handleGoToNodePage = () => {
        router.push(`/publishers/${publisherId}/nodes/${nodeId}`)
    }

    const resetProcess = () => {
        setCurrentStage('info_confirmation')
        setError(null)
        setIsVerified(false)
        setGithubToken(null)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner size="xl" />
            </div>
        )
    }

    return (
        <div className="container p-6 mx-auto">
            <Head>
                <title>
                    {node
                        ? t('Claim Node: {{nodeName}}', { nodeName: node.name })
                        : t('Claim Node')}{' '}
                    | Comfy Registry
                </title>
                <meta
                    name="description"
                    content={t(
                        'Verify your GitHub repository ownership to claim this node for your publisher account.'
                    )}
                />
            </Head>

            <div
                className="flex items-center cursor-pointer mb-8"
                onClick={handleGoBack}
            >
                <svg
                    className="w-4 h-4 text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m15 19-7-7 7-7"
                    />
                </svg>
                <span className="text-gray-400 pl-1 text-base">
                    {t('Back to node details')}
                </span>
            </div>

            <h1 className="mb-4 text-3xl font-bold text-white">
                {t('Claim Node: {{nodeName}}', { nodeName: node?.name })}
            </h1>

            {/* Display any critical errors that prevent claiming */}
            {error && (
                <Alert color="failure" className="mb-6">
                    <h3 className="text-lg font-medium">{t('Error')}</h3>
                    <p>{error}</p>
                    <div className="mt-4">
                        <Button color="light" size="sm" onClick={resetProcess}>
                            {t('Try Again')}
                        </Button>
                    </div>
                </Alert>
            )}

            <div className="bg-gray-800 p-6 rounded-lg mb-6">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-white">
                            {t('Claim Process')}
                        </h3>
                    </div>
                    <div className="relative">
                        {/* Progress line - positioned below the circles */}
                        <div className="absolute top-4 left-0 right-0 flex h-0.5 z-0">
                            <div
                                className={`h-full bg-green-500`}
                                style={{
                                    width:
                                        currentStage === 'info_confirmation'
                                            ? '0%'
                                            : currentStage === 'github_login'
                                              ? '25%'
                                              : currentStage ===
                                                  'verifying_admin'
                                                ? '50%'
                                                : currentStage === 'claim_node'
                                                  ? '75%'
                                                  : '100%',
                                }}
                            ></div>
                            <div className={`h-full bg-gray-700 flex-1`}></div>
                        </div>

                        {/* Step circles - with higher z-index to appear above the line */}
                        <div className="flex mb-2 relative z-10">
                            {[
                                'info_confirmation',
                                'github_login',
                                'verifying_admin',
                                'claim_node',
                                'completed',
                            ].map((stage, index) => (
                                <div key={stage} className="flex-1 text-center">
                                    <div
                                        className={`mx-auto rounded-full flex items-center justify-center w-8 h-8 mb-1
                                        ${
                                            stage === currentStage
                                                ? 'bg-blue-600 text-white'
                                                : [
                                                        'info_confirmation',
                                                        'github_login',
                                                        'verifying_admin',
                                                        'claim_node',
                                                        'completed',
                                                    ].indexOf(currentStage) >
                                                    [
                                                        'info_confirmation',
                                                        'github_login',
                                                        'verifying_admin',
                                                        'claim_node',
                                                        'completed',
                                                    ].indexOf(
                                                        stage as ClaimStage
                                                    )
                                                  ? 'bg-green-500 text-white'
                                                  : 'bg-gray-700 text-gray-400'
                                        }`}
                                    >
                                        {index + 1}
                                    </div>
                                    <div
                                        className={`text-xs mt-1 ${
                                            stage === currentStage
                                                ? 'text-blue-500 font-medium'
                                                : [
                                                        'info_confirmation',
                                                        'github_login',
                                                        'verifying_admin',
                                                        'claim_node',
                                                        'completed',
                                                    ].indexOf(currentStage) >
                                                    [
                                                        'info_confirmation',
                                                        'github_login',
                                                        'verifying_admin',
                                                        'claim_node',
                                                        'completed',
                                                    ].indexOf(
                                                        stage as ClaimStage
                                                    )
                                                  ? 'text-green-500'
                                                  : 'text-gray-500'
                                        }`}
                                    >
                                        {stage === 'info_confirmation' &&
                                            t('Info')}
                                        {stage === 'github_login' &&
                                            t('GitHub Login')}
                                        {stage === 'verifying_admin' &&
                                            t('Verify Admin')}
                                        {stage === 'claim_node' &&
                                            t('Claim Node')}
                                        {stage === 'completed' && t('Complete')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stage 1: Confirm Claiming Information */}
                {currentStage === 'info_confirmation' && (
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">
                            {t('Step 1: Confirm Node Information')}
                        </h2>
                        <div className="bg-gray-700 p-4 rounded-lg mb-6">
                            <h3 className="text-lg font-medium text-white mb-2">
                                {t('Node Information')}
                            </h3>
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-start">
                                    <span className="text-gray-400 w-24">
                                        {t('Node')}:
                                    </span>
                                    <NodeSpan
                                        nodeId={
                                            (router.query.nodeId as string) ||
                                            (nodeId as string)
                                        }
                                        nodeName={node?.name}
                                        className="text-white"
                                    />
                                </div>
                                <div className="flex items-start">
                                    <span className="text-gray-400 w-24">
                                        {t('Repository')}:
                                    </span>
                                    <span className="text-white break-all">
                                        {node?.repository}
                                    </span>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-gray-400 w-24">
                                        {t('Publisher')}:
                                    </span>
                                    <span className="text-gray-400 font-bold">
                                        {t('Unclaimed')}
                                    </span>
                                    <span className="mx-1 text-gray-500">
                                        &rarr;
                                    </span>
                                    <PublisherSpan
                                        publisherId={publisherId as string}
                                        publisherName={publisherToClaim?.name}
                                        className="text-white font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-300 mb-4">
                                {t(
                                    'To claim this node, you must verify that you are an admin of the GitHub repository associated with it. Please confirm the information above is correct before proceeding.'
                                )}
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <Button color="blue" onClick={initiateGitHubOAuth}>
                                <svg
                                    className="w-4 h-4 mr-2"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {t('Continue with GitHub')}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Stage 2: GitHub Login */}
                {currentStage === 'github_login' && (
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">
                            {t('Step 2: GitHub Authentication')}
                        </h2>
                        <div className="bg-gray-700 p-4 rounded-lg mb-6 flex items-center justify-center">
                            <div className="text-center py-8">
                                <Spinner size="xl" className="mb-4" />
                                <p className="text-white">
                                    {t(
                                        'Redirecting to GitHub for authentication...'
                                    )}
                                </p>
                                <p className="text-gray-400 text-sm mt-2">
                                    {t(
                                        'Please wait or follow the GitHub prompts if they appear.'
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stage 3: Verifying Admin */}
                {currentStage === 'verifying_admin' && (
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">
                            {t('Step 3: Verifying Repository Admin Access')}
                        </h2>
                        <div className="bg-gray-700 p-4 rounded-lg mb-6 flex items-center justify-center">
                            <div className="text-center py-8">
                                {permissionCheckLoading ? (
                                    <>
                                        <Spinner size="xl" className="mb-4" />
                                        <p className="text-white">
                                            {t(
                                                'Verifying your admin access to the repository...'
                                            )}
                                        </p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            {t(
                                                'This should only take a moment.'
                                            )}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-12 h-12 text-yellow-500 mx-auto mb-4"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 13V9m0 8h.01M12 3c-1.857 0-3.637.75-4.95 2.08C5.737 6.412 5 8.21 5 10.083c0 1.499.5 2.956 1.414 4.128L12 21l5.586-6.789A7.177 7.177 0 0 0 19 10.083c0-1.872-.737-3.671-2.05-5.003A6.928 6.928 0 0 0 12 3Z"
                                            />
                                        </svg>
                                        <p className="text-white">
                                            {t(
                                                'Processing verification result...'
                                            )}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Stage 4: Claim Node */}
                {currentStage === 'claim_node' && (
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">
                            {t('Step 4: Claim Your Node')}
                        </h2>
                        <div className="bg-gray-700 p-4 rounded-lg mb-6">
                            <div className="flex items-center mb-4">
                                <svg
                                    className="w-5 h-5 text-green-500 mr-2"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 12l4.7 4.5 9.3-9"
                                    />
                                </svg>
                                <h3 className="text-lg font-medium text-white">
                                    {t('Verification Successful')}
                                </h3>
                            </div>
                            <p className="text-gray-300 mb-4">
                                {t(
                                    'Your GitHub account ({{username}}) has been verified with admin permissions to the repository. You can now claim node {{nodeName}} as publisher: {{publisherName}}.',
                                    {
                                        username: githubUsername,
                                        nodeName: node?.name,
                                        publisherName: publisherToClaim?.name,
                                    }
                                )}
                            </p>
                            <div className="flex justify-end">
                                <Button
                                    color="blue"
                                    onClick={handleClaimNode}
                                    disabled={isClaimingNode}
                                >
                                    {isClaimingNode ? (
                                        <>
                                            <Spinner
                                                className="mr-2"
                                                size="sm"
                                            />
                                            {t('Claiming Node...')}
                                        </>
                                    ) : (
                                        t('Claim Node')
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stage 5: Completed */}
                {currentStage === 'completed' && (
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">
                            {t('Step 5: Claim Successful')}
                        </h2>
                        <div className="bg-gray-700 p-4 rounded-lg mb-6">
                            <div className="flex items-center mb-4">
                                <svg
                                    className="w-5 h-5 text-green-500 mr-2"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 12l4.7 4.5 9.3-9"
                                    />
                                </svg>
                                <h3 className="text-lg font-medium text-white">
                                    {t('Node Claimed Successfully')}
                                </h3>
                            </div>
                            <p className="text-gray-300 mb-4">
                                {t(
                                    'Congratulations! You have successfully claimed the node {{nodeName}} for publisher {{publisherName}}. You can now manage this node through your publisher account.',
                                    {
                                        nodeName: node?.name,
                                        publisherName: publisherToClaim?.name,
                                    }
                                )}
                            </p>
                            <div className="flex justify-end">
                                <Button
                                    color="blue"
                                    onClick={handleGoToNodePage}
                                >
                                    {t('Go to Node Page')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default withAuth(ClaimMyNodePage)
