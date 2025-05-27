/**
 * Custom API extensions for functionality not yet available in the generated API
 */
import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { customInstance } from './mutator/axios-instance';

// Type definitions
export interface ClaimNodeRequest {
    nodeId: string;
    publisherId: string;
    githubUserId: string;
}

export interface ClaimNodeResponse {
    success: boolean;
    message: string;
}

// Actual API function that would call the backend
const claimNode = async (data: ClaimNodeRequest): Promise<ClaimNodeResponse> => {
    return customInstance({
        url: `/nodes/${data.nodeId}/claim`,
        method: 'post',
        data: {
            publisherId: data.publisherId,
            githubUserId: data.githubUserId
        }
    });
};

// Mutation hook for use in components
export const useClaimNodeMutation = <
    TError = unknown,
    TContext = unknown
>(
    options?: UseMutationOptions<
        ClaimNodeResponse, 
        TError,
        ClaimNodeRequest, 
        TContext
    >
): UseMutationResult<
    ClaimNodeResponse,
    TError,
    ClaimNodeRequest,
    TContext
> => {
    return useMutation<
        ClaimNodeResponse,
        TError,
        ClaimNodeRequest,
        TContext
    >(
        (data) => claimNode(data),
        options
    );
};
