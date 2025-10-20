import { url } from 'inspector'
import {
    getGetNodeByComfyNodeNameQueryOptions,
    getGetNodeQueryOptions,
    getListComfyNodesQueryOptions,
    getListNodeVersionsQueryOptions,
} from '@/src/api/generated'
import { REQUEST_OPTIONS_NO_CACHE } from '@/src/constants'
//
// This file should keep track with backend:
// https://github.com/Comfy-Org/comfy-api/blob/main/server/middleware/cache_control.go
//
// Currently only below queries have cache control header:
/*

// nodeEndpointPattern matches exactly /nodes/{nodeId}
var nodeEndpointPattern = regexp.MustCompile(`^/nodes/[^/]+$`)

// nodeVersionsEndpointPattern matches exactly /nodes/{nodeId}/versions
var nodeVersionsEndpointPattern = regexp.MustCompile(`^/nodes/[^/]+/versions$`)

// comfyNodesNodeEndpointPattern matches exactly /comfy-nodes/{comfyNodeName}/node
var comfyNodesNodeEndpointPattern = regexp.MustCompile(`^/comfy-nodes/[^/]+/node$`)

// comfyNodesListEndpointPattern matches exactly /nodes/{nodeId}/versions/{versionId}/comfy-nodes
var comfyNodesListEndpointPattern = regexp.MustCompile(`^/nodes/[^/]+/versions/[^/]+/comfy-nodes$`)

*/
// which is below 4 endpoints:
// they must be refetched with INVALIDATE_CACHE_OPTION after any editing operation,
// or all users will still fetch the cached data from proxies/cdns/isps cache
export const shouldRevalidateRegex = {
    nodeEndpointPattern: /^\/nodes\/[^/]+$/,
    nodeVersionsEndpointPattern: /^\/nodes\/[^/]+\/versions$/,
    comfyNodesNodeEndpointPattern: /^\/comfy-nodes\/[^/]+\/node$/,
    comfyNodesListEndpointPattern:
        /^\/nodes\/[^/]+\/versions\/[^/]+\/comfy-nodes$/,
}
export function isCacheControlEndpointQ(pathname: string): boolean {
    return Object.values(shouldRevalidateRegex).some((regex) =>
        regex.test(pathname)
    )
}

/**
 * Endpoints should Invalidate cache after editing operations
 *
 * e.g for nodes:
 *
 * Hook to refetch the node data after creating a new node.
 * This is used to ensure that the newly created node is immediately available
 * in the cache and can be displayed without delay.
 *
 * call this whenever you create a new node / update an existing node / delete a node
 *
 * @example
 *
 *   const qc = useQueryClient()
 *
 *   qc.fetchQuery(
 *       shouldInvalidate
 *          .getGetNodeQueryOptions(
 *              nodeId as string,
 *              undefined,
 *              INVALIDATE_CACHE_OPTION
 *           )
 *   )
 *
 */
export const shouldInvalidate = {
    getGetNodeQueryOptions,
    getListNodeVersionsQueryOptions,
    getGetNodeByComfyNodeNameQueryOptions,
    getListComfyNodesQueryOptions,
}

export const INVALIDATE_CACHE_OPTION = {
    query: { staleTime: 0 }, // force refetch
    request: REQUEST_OPTIONS_NO_CACHE,
}
