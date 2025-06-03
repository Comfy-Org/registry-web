/**
 * Claim My Node Page
 * This page allows a publisher to claim ownership of an unclaimed node by verifying
 * their ownership of the GitHub repository.
 * 
 * @author: snomiao <snomiao@gmail.com>
 */
import withAuth from '@/components/common/HOC/withAuth'
import { Alert, Button, Spinner } from 'flowbite-react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import analytic from 'src/analytic/analytic'
import { useClaimNodeMutation } from 'src/api/customHooks'
import {
    useGetNode,
    useGetPublisher,
    useGetUser,
} from 'src/api/generated'
import { UNCLAIMED_ADMIN_PUBLISHER_ID } from 'src/constants'

function ClaimMyNodePage() {
    const router = useRouter()
    const { publisherId, nodeId } = router.query
    const [isVerifying, setIsVerifying] = useState(false)
    const [isVerified, setIsVerified] = useState(false)
    const [githubUserId, setGithubUserId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    
    // Get the node, publisher, and current user
    const { data: node, isLoading: nodeLoading } = useGetNode(nodeId as string, {}, { 
        query: { enabled: !!nodeId } 
    })
    const { data: publisher, isLoading: publisherLoading } = useGetPublisher(publisherId as string, { 
        query: { enabled: !!publisherId } 
    })
    const { data: user, isLoading: userLoading } = useGetUser()
    
    // Mutation for claiming the node
    const { mutate: claimNode, isLoading: isClaimingNode } = useClaimNodeMutation({
        onSuccess: () => {
            toast.success('Node claimed successfully!')
            analytic.track('Node Claimed', {
                nodeId,
                publisherId,
            })
            // Redirect to the node details page
            router.push(`/publishers/${publisherId}/nodes/${nodeId}`)
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to claim node. Please try again.')
            setError('Unable to claim the node. Please try again or contact support.')
        },
    })
    
    const isLoading = nodeLoading || publisherLoading || userLoading
    
    useEffect(() => {
        // Initialize GitHub OAuth if node and publisher data is loaded
        if (!node || !publisher || !user) return
        
        // Check if the node is available for claiming
        if (node.publisher?.id !== UNCLAIMED_ADMIN_PUBLISHER_ID) {
            setError('This node is already claimed and cannot be claimed again.')
            return
        }
        
        // Check if we have a nodeId in the query params
        const nodeIdParam = router.query.nodeId as string
        if (!nodeIdParam) {
            setError('Node ID is required for claiming.')
            return
        }
        
        // Get repository info from the node
        const repoUrl = node.repository
        if (!repoUrl) {
            setError('This node does not have a repository URL.')
            return
        }
        
        // Extract GitHub owner and repo from URL
        // For example: https://github.com/owner/repo
        const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        if (!repoMatch) {
            setError('Invalid GitHub repository URL format.')
            return
        }
        
        // Start the GitHub OAuth flow
        const initiateGitHubOAuth = async () => {
            try {
                setIsVerifying(true)
                
                // In a real implementation, we would call a backend API to handle GitHub OAuth
                // and verify repository ownership
                
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 2000))
                
                // Mock successful verification
                setIsVerified(true)
                setGithubUserId('mock-github-user-id')
                setIsVerifying(false)
                
                analytic.track('GitHub Verification Success', {
                    nodeId: nodeIdParam,
                    publisherId,
                })
            } catch (err) {
                console.error('GitHub OAuth error:', err)
                setIsVerifying(false)
                setError('Failed to verify GitHub account. Please try again.')
                
                analytic.track('GitHub Verification Failed', {
                    nodeId: nodeIdParam,
                    publisherId,
                    error: err,
                })
            }
        }
        
        initiateGitHubOAuth()
    }, [node, publisher, user, nodeId, publisherId, router.query])
    
    const handleClaimNode = () => {
        if (!isVerified || !githubUserId) {
            toast.error('GitHub verification is required before claiming the node.')
            return
        }
        
        const nodeIdParam = router.query.nodeId as string
        if (!nodeIdParam) {
            toast.error('Node ID is required for claiming.')
            return
        }
        
        // Call the mutation function with the required parameters
        claimNode({
            nodeId: nodeIdParam,
            publisherId: publisherId as string,
            githubUserId: githubUserId,
        })
    }
    
    const handleGoBack = () => {
        router.push(`/nodes/${nodeId}`)
    }
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner size="xl" />
            </div>
        )
    }
    
    if (error) {
        return (
            <div className="container p-6 mx-auto">
                <Head>
                    <title>Error Claiming Node | Comfy Registry</title>
                    <meta 
                        name="description" 
                        content="There was an error claiming this node." 
                    />
                </Head>
                
                <div className="flex items-center cursor-pointer mb-8" onClick={handleGoBack}>
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
                        Back to node details
                    </span>
                </div>
                
                <Alert color="failure">
                    <h3 className="text-lg font-medium">Error</h3>
                    <p>{error}</p>
                    <div className="mt-4">
                        <Button color="light" onClick={handleGoBack}>
                            Back to Node Details
                        </Button>
                    </div>
                </Alert>
            </div>
        )
    }
    
    return (
        <div className="container p-6 mx-auto">
            <Head>
                <title>
                    {node ? `Claim Node: ${node.name}` : 'Claim Node'} | Comfy Registry
                </title>
                <meta 
                    name="description" 
                    content="Verify your GitHub repository ownership to claim this node for your publisher account." 
                />
            </Head>
            
            <div className="flex items-center cursor-pointer mb-8" onClick={handleGoBack}>
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
                    Back to node details
                </span>
            </div>
            
            <h1 className="mb-4 text-3xl font-bold text-white">
                Claim Node: {node?.name}
            </h1>
            
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-bold text-white mb-4">
                    GitHub Repository Verification
                </h2>
                
                <p className="text-gray-300 mb-6">
                    To claim this node, we need to verify that you own or have permissions to the GitHub repository associated with this node.
                </p>
                
                <div className="bg-gray-700 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-medium text-white mb-2">Repository Information</h3>
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-start">
                            <span className="text-gray-400 w-24">Repository:</span>
                            <span className="text-white break-all">{node?.repository}</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-gray-400 w-24">Node ID:</span>
                            <span className="text-white">{router.query.nodeId}</span>
                        </div>
                        <div className="flex items-start">
                            <span className="text-gray-400 w-24">Publisher:</span>
                            <span className="text-white">{publisher?.name} (@{publisher?.id})</span>
                        </div>
                    </div>
                </div>
                
                <div className="mb-6">
                    <div className="flex items-start mb-4">
                        <div className="mr-3 mt-1">
                            {isVerifying ? (
                                <div className="h-5 w-5 flex justify-center items-center">
                                    <Spinner size="sm" />
                                </div>
                            ) : isVerified ? (
                                <svg
                                    className="w-5 h-5 text-green-500"
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
                            ) : (
                                <svg
                                    className="w-5 h-5 text-blue-500"
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
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-white">
                                GitHub Repository Verification
                            </h3>
                            <p className="text-gray-400">
                                {isVerifying
                                    ? 'Verifying your GitHub account and repository permissions...'
                                    : isVerified
                                    ? 'Successfully verified your GitHub account and repository permissions.'
                                    : 'Waiting to verify your GitHub account and repository permissions.'}
                            </p>
                        </div>
                    </div>
                </div>
                
                {isVerified && (
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
                                Ready to Claim
                            </h3>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Your GitHub account has been verified and you can now claim this node as
                            publisher: <strong>{publisher?.name}</strong>.
                        </p>
                        <div className="flex justify-end">
                            <Button
                                color="blue"
                                onClick={handleClaimNode}
                                disabled={isClaimingNode}
                            >
                                {isClaimingNode ? (
                                    <>
                                        <Spinner className="mr-2" size="sm" />
                                        Claiming Node...
                                    </>
                                ) : (
                                    'Claim Node'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
                
                {!isVerified && !isVerifying && (
                    <div className="flex justify-end">
                        <Button
                            color="blue"
                            onClick={() => {
                                // Retry verification if it failed
                                setIsVerifying(true)
                                
                                // In a real implementation, this would restart the GitHub OAuth flow
                                analytic.track('Retry GitHub Verification', {
                                    nodeId: router.query.nodeId,
                                    publisherId,
                                })
                                
                                // Simulate verification process
                                setTimeout(() => {
                                    setIsVerified(true)
                                    setGithubUserId('mock-github-user-id')
                                    setIsVerifying(false)
                                }, 2000)
                            }}
                        >
                            <svg
                                className="w-4 h-4 mr-2"
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
                                    d="M17.7 7.7A7.1 7.1 0 0 0 5 10.8M18 4v4h-4m-7.7 8.3A7.1 7.1 0 0 0 19 13.2M6 20v-4h4"
                                />
                            </svg>
                            Verify GitHub Repository
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default withAuth(ClaimMyNodePage)
