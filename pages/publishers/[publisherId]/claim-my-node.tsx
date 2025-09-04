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
import { useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Spinner } from 'flowbite-react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Octokit } from 'octokit'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { FaGithub } from 'react-icons/fa'
import { HiChevronLeft, HiCheckCircle, HiLocationMarker } from 'react-icons/hi'
import analytic from 'src/analytic/analytic'
import {
    useClaimMyNode,
    useGetNode,
    useGetPublisher,
    useGetUser,
    getGetNodeQueryKey,
    getListNodesForPublisherV2QueryKey,
    getSearchNodesQueryKey,
    getGetNodeQueryOptions,
    getListNodesForPublisherV2QueryOptions,
} from 'src/api/generated'
import { UNCLAIMED_ADMIN_PUBLISHER_ID } from 'src/constants'
import { AxiosError } from 'axios'
import {
    INVALIDATE_CACHE_OPTION,
    shouldInvalidate,
} from '@/components/cache-control'

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
    const qc = useQueryClient()
    const { publisherId, nodeId } = router.query
    const [currentStage, setCurrentStage] =
        useState<ClaimStage>('info_confirmation')
    const [isVerifying, setIsVerifying] = useState(false)
    const [isVerified, setIsVerified] = useState(false)
    const [githubToken, setGithubToken] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [permissionCheckLoading, setPermissionCheckLoading] = useState(false)
    const [githubUsername, setGithubUsername] = useState<string | undefined>(
        undefined
    )
    const [claimCompletedAt, setClaimCompletedAt] = useState<Date | null>(null)

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
                if (!nodeId || !publisherId)
                    throw new Error(
                        'SHOULD NEVER HAPPEN: Node or publisher data is missing after claim success'
                    )
                toast.success(t('Node claimed successfully!'))
                analytic.track('Node Claimed', {
                    nodeId,
                    publisherId,
                })

                // Invalidate caches to refresh data

                // Prefetch the created nodeId to refresh the node data
                // MUST make a request to server immediately to invalidate upstream proxies/cdns/isps cache
                // then other users can see the new node by refetch
                qc.prefetchQuery(
                    shouldInvalidate.getGetNodeQueryOptions(
                        nodeId as string,
                        undefined,
                        INVALIDATE_CACHE_OPTION
                    )
                )

                // ----
                // there are no cache control headers in the endpoints below
                // so we dont need to refetch them with no-cache header, just invalidateQueries is enough
                // ----

                // Invalidate multiple query caches
                ;[
                    // Unclaimed nodes list (node removed from @UNCLAIMED_ADMIN_PUBLISHER_ID)
                    getListNodesForPublisherV2QueryKey(
                        UNCLAIMED_ADMIN_PUBLISHER_ID
                    ),
                    // New publisher's nodes list as it may include the newly claimed node
                    getListNodesForPublisherV2QueryKey(publisherId as string),
                    // Search results which might include this node
                    getSearchNodesQueryKey().slice(0, 1),
                ].forEach((queryKey) => {
                    qc.invalidateQueries({ queryKey })
                })

                // Set stage to completed
                setCurrentStage('completed')

                // Set claim completion time for timer
                setClaimCompletedAt(new Date())
            },
            onError: (error: any) => {
                // axios error handling
                const errorMessage =
                    error?.response?.data?.message ||
                    error?.message ||
                    t('Unknown error')
                analytic.track('Node Claim Failed', {
                    nodeId,
                    publisherId,
                    errorMessage,
                })
                toast.error(
                    t('Failed to claim node. {{error}}', {
                        error: errorMessage,
                    })
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
    const verifyRepoPermissions = useCallback(
        async (
            token: string,
            owner: string,
            repo: string,
            nodeIdParam: string
        ): Promise<{
            hasPermission: boolean
            userInfo?: { username: string }
            errorMessage?: string
        }> => {
            try {
                setPermissionCheckLoading(true)

                // Initialize Octokit with the user's token
                const octokit = new Octokit({
                    auth: token,
                })

                // Get GitHub user info first using Octokit REST API
                let userInfo: { username: string } | undefined
                try {
                    const { data: userData } =
                        await octokit.rest.users.getAuthenticated()
                    userInfo = {
                        username: userData.login,
                    }
                    setGithubUsername(userData.login)
                } catch (error) {
                    // If we can't get user data, set userInfo to undefined and allow retry
                    setGithubUsername(undefined)
                    return {
                        hasPermission: false,
                        userInfo: undefined,
                        errorMessage: t(
                            'Failed to get GitHub user information. Please try again.'
                        ),
                    }
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
                        return {
                            hasPermission: true,
                            userInfo,
                        }
                    }

                    // If we have basic access but need to verify specific permission level
                    try {
                        // Check collaborator permission level
                        const { data: permissionData } =
                            await octokit.rest.repos.getCollaboratorPermissionLevel(
                                {
                                    owner,
                                    repo,
                                    username: userInfo.username,
                                }
                            )

                        // Check if user has admin permission level
                        const permission = permissionData.permission
                        if (permission === 'admin') {
                            return {
                                hasPermission: true,
                                userInfo,
                            }
                        }
                    } catch (permissionError) {
                        // If we can't check specific permissions, we'll assume no admin access
                        return {
                            hasPermission: false,
                            userInfo,
                            errorMessage: t(
                                'You (GitHub user: {{username}}) do not have admin permission to this repository ({{owner}}/{{repo}}, Node ID: {{nodeId}}). Only repository administrators can claim nodes.',
                                {
                                    username: userInfo.username,
                                    owner,
                                    repo,
                                    nodeId: nodeIdParam,
                                }
                            ),
                        }
                    }

                    // If we've reached here without a definitive answer, be conservative
                    return {
                        hasPermission: false,
                        userInfo,
                        errorMessage: t(
                            'You (GitHub user: {{username}}) do not have admin permission to this repository ({{owner}}/{{repo}}, Node ID: {{nodeId}}). Only repository administrators can claim nodes.',
                            {
                                username: userInfo.username,
                                owner,
                                repo,
                                nodeId: nodeIdParam,
                            }
                        ),
                    }
                } catch (repoError) {
                    // Repository not found or user doesn't have access
                    return {
                        hasPermission: false,
                        userInfo,
                        errorMessage: t(
                            'Repository {{owner}}/{{repo}} not found or you do not have access to it.',
                            { owner, repo }
                        ),
                    }
                }
            } catch (err: any) {
                // Instead of throwing an error, return structured error info
                return {
                    hasPermission: false,
                    userInfo: undefined,
                    errorMessage: t(
                        'There was an unexpected error verifying your repository permissions. Please try again.'
                    ),
                }
            } finally {
                setPermissionCheckLoading(false)
            }
        },
        [t]
    )

    useEffect(() => {
        // Initialize GitHub OAuth if node and publisher data is loaded
        if (!node || !publisherToClaim || !user) return
        if (currentStage === 'completed') return

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
            verifyRepoPermissions(token, owner, repo, nodeIdParam)
                .then((result) => {
                    if (result.hasPermission) {
                        setIsVerified(true)
                        setCurrentStage('claim_node')
                        analytic.track('GitHub Verification Success', {
                            nodeId: nodeIdParam,
                            publisherId,
                            githubUsername: result.userInfo?.username,
                            hasAdminPermission: true,
                        })
                    } else {
                        const errorMsg =
                            result.errorMessage ||
                            t(
                                'Unable to verify repository permissions. Please try again.'
                            )
                        setError(errorMsg)
                        analytic.track('GitHub Verification Failed', {
                            nodeId: nodeIdParam,
                            publisherId,
                            githubUsername: result.userInfo?.username,
                            reason: 'No admin permission',
                        })
                    }
                })
                .catch((err) => {
                    // This should rarely happen now since we return structured errors
                    // But just in case there's an unexpected error
                    const errorMsg = t(
                        'There was an unexpected error verifying your repository permissions. Please try again.'
                    )
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
        router,
        currentStage,
        t,
        verifyRepoPermissions,
    ])

    const initiateGitHubOAuth = () => {
        if (!node || !publisherId || !nodeId) return

        setIsVerifying(true)
        setCurrentStage('github_login')

        // Extract repo information
        const repoUrl = node.repository
        const repoMatch = repoUrl!.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        if (!repoMatch) {
            setError(t('Invalid GitHub repository URL format.'))
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

    function renderPublisher(publisherId: string | undefined) {
        if (!publisherId) return null
        if (publisherId === UNCLAIMED_ADMIN_PUBLISHER_ID) {
            return t('Unclaimed')
        }
        return `@${publisherId}`
    }

    const resetProcess = () => {
        setCurrentStage('info_confirmation')
        setError(null)
        setIsVerified(false)
        setGithubToken(null)
        setClaimCompletedAt(null)
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
                <HiChevronLeft className="w-4 h-4 text-gray-400" />
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
                                    <span className="text-gray-400 w-32 ">
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
                                    <span className="text-gray-400 w-32 ">
                                        {t('Repository')}:
                                    </span>
                                    <span className="text-white break-all">
                                        {node?.repository}
                                    </span>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-gray-400 w-32 ">
                                        {t('Publisher')}:
                                    </span>
                                    <span className="text-gray-400 font-bold">
                                        {renderPublisher(node?.publisher?.id)}
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
                                <FaGithub className="w-4 h-4 mr-2" />
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
                                        <HiLocationMarker className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
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
                                <HiCheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                <h3 className="text-lg font-medium text-white">
                                    {t('Verification Successful')}
                                </h3>
                            </div>
                            <p className="text-gray-300 mb-4">
                                {githubUsername
                                    ? t(
                                          'Your GitHub account ({{username}}) has been verified with admin permissions to the repository. You can now claim node {{nodeName}} as publisher: {{publisherName}}.',
                                          {
                                              username: githubUsername,
                                              nodeName: node?.name,
                                              publisherName:
                                                  publisherToClaim?.name,
                                          }
                                      )
                                    : t(
                                          'Your GitHub account has been verified with admin permissions to the repository. You can now claim node {{nodeName}} as publisher: {{publisherName}}.',
                                          {
                                              nodeName: node?.name,
                                              publisherName:
                                                  publisherToClaim?.name,
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
                                <HiCheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                <h3 className="text-lg font-medium text-white">
                                    {t('Node Claimed Successfully')}
                                </h3>
                            </div>
                            <p className="text-gray-300 mb-6">
                                {t(
                                    'Congratulations! You have successfully claimed the node {{nodeName}} for publisher {{publisherName}}.',
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
                                    {t('Go to the Node Page')}
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
