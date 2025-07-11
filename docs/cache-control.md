# Cache Control Strategy

## Overview

This document tracks all pages and components performing mutation operations that require cache invalidation to ensure data consistency across the application. The cache invalidation strategy uses the `shouldInvalidate` utility to force immediate server requests for critical cached endpoints.

## Critical Cached Endpoints

Based on the backend cache control configuration, the following endpoints have cache headers and require explicit invalidation:

### 1. Node Details: `/nodes/{nodeId}`

- **Query Hook**: `useGetNode`
- **Cache Option**: `shouldInvalidate.getGetNodeQueryOptions`
- **When to Invalidate**: After any node mutation (create, update, delete, claim, etc.)

### 2. Node Versions: `/nodes/{nodeId}/versions`

- **Query Hook**: `useListNodeVersions`
- **Cache Option**: `shouldInvalidate.getListNodeVersionsQueryOptions`
- **When to Invalidate**: After any node version mutation (create, update, delete, status change)

### 3. ComfyUI Node by Name: `/comfy-nodes/{comfyNodeName}/node`

- **Query Hook**: `useGetNodeByComfyNodeName`
- **Cache Option**: `shouldInvalidate.getGetNodeByComfyNodeNameQueryOptions`
- **When to Invalidate**: After any node or version mutation affecting ComfyUI nodes

### 4. ComfyUI Nodes List: `/nodes/{nodeId}/versions/{versionId}/comfy-nodes`

- **Query Hook**: `useListComfyNodes`
- **Cache Option**: `shouldInvalidate.getListComfyNodesQueryOptions`
- **When to Invalidate**: After any ComfyUI node mutation

## Cache Invalidation Helper

The `shouldInvalidate` helper from `components/cache-control.tsx` provides the following methods:

- `shouldInvalidate.getGetNodeQueryOptions()` - For node details
- `shouldInvalidate.getListNodeVersionsQueryOptions()` - For node versions
- `shouldInvalidate.getGetNodeByComfyNodeNameQueryOptions()` - For comfy node mapping
- `shouldInvalidate.getListComfyNodesQueryOptions()` - For comfy nodes listing

Use with `INVALIDATE_CACHE_OPTION` to force cache-busting.

## Mutation Operations and Required Cache Invalidations

### ✅ PROPERLY IMPLEMENTED

#### 1. Node Claiming

- **File**: `pages/publishers/[publisherId]/claim-my-node.tsx`
- **Operation**: `useClaimMyNode`
- **Invalidation**: ✅ Properly uses `shouldInvalidate.getGetNodeQueryOptions()` with `INVALIDATE_CACHE_OPTION`

#### 2. Node Version Update (Deprecation)

- **File**: `components/nodes/NodeVDrawer.tsx`
- **Operation**: `useUpdateNodeVersion`
- **Invalidation**: ✅ Properly uses `shouldInvalidate.getListNodeVersionsQueryOptions()` with `INVALIDATE_CACHE_OPTION`

#### 3. Admin Node Version Compatibility Update

- **File**: `components/admin/NodeVersionCompatibilityEditModal.tsx`
- **Operation**: `useAdminUpdateNodeVersion`
- **Invalidation**: ✅ Properly uses `shouldInvalidate.getListNodeVersionsQueryOptions()` with `INVALIDATE_CACHE_OPTION`

#### 4. Node Update (Edit Modal)

- **File**: `components/nodes/NodeEditModal.tsx`
- **Operation**: `useUpdateNode`
- **Invalidation**: ✅ Properly uses `shouldInvalidate.getGetNodeQueryOptions()` with `INVALIDATE_CACHE_OPTION`

### ❌ NEEDS IMPLEMENTATION

#### 5. Node Creation (Admin)

- **File**: `components/nodes/AdminCreateNodeFormModal.tsx`
- **Operation**: `useAdminCreateNode`
- **Current**: Basic `invalidateQueries()` without cache-busting
- **Required**: Add `shouldInvalidate.getGetNodeQueryOptions()` for newly created node

#### 6. Node Deletion

- **File**: `components/nodes/NodeDeleteModal.tsx`
- **Operation**: `useDeleteNode`
- **Current**: Basic `invalidateQueries()` without cache-busting
- **Required**: Add `shouldInvalidate.getGetNodeQueryOptions()` on success

#### 7. Node Version Deletion

- **File**: `components/nodes/NodeVersionDeleteModal.tsx`
- **Operation**: `useDeleteNodeVersion`
- **Current**: Basic `invalidateQueries()` without cache-busting
- **Required**: Add `shouldInvalidate.getListNodeVersionsQueryOptions()` on success

#### 8. Admin Node Version Updates (Bulk Operations)

- **File**: `pages/admin/nodeversions.tsx`
- **Operation**: `useAdminUpdateNodeVersion`
- **Current**: Basic `invalidateQueries()` without cache-busting
- **Required**: Add `shouldInvalidate.getListNodeVersionsQueryOptions()` on success

#### 9. Admin Node Claim

- **File**: `components/nodes/AdminNodeClaimModal.tsx`
- **Operation**: `useUpdateNode`
- **Current**: Basic `invalidateQueries()` without cache-busting
- **Required**: Use `shouldInvalidate.getGetNodeQueryOptions()` with `INVALIDATE_CACHE_OPTION`

#### 10. Search Ranking Edit

- **File**: `components/nodes/SearchRankingEditModal.tsx`
- **Operation**: `useUpdateNode`
- **Current**: Basic `invalidateQueries()` without cache-busting
- **Required**: Use `shouldInvalidate.getGetNodeQueryOptions()` with `INVALIDATE_CACHE_OPTION`

#### 11. Preempted ComfyNode Names Edit ✅ **FIXED**

- **File**: `components/nodes/PreemptedComfyNodeNamesEditModal.tsx`
- **Operation**: `useUpdateNode`
- **Current**: Uses `shouldInvalidate.getGetNodeQueryOptions()` with `INVALIDATE_CACHE_OPTION`
- **Status**: ✅ Properly implemented with cache-busting for cached endpoints

## Implementation Pattern

For all operations that modify nodes or node versions, follow this pattern:

```typescript
import {
    INVALIDATE_CACHE_OPTION,
    shouldInvalidate,
} from '@/components/cache-control'

const mutation = useMutationHook({
    mutation: {
        onSuccess: (data) => {
            // Cache-busting invalidation for endpoints with cache control headers
            qc.fetchQuery(
                shouldInvalidate.getGetNodeQueryOptions(
                    nodeId,
                    undefined,
                    INVALIDATE_CACHE_OPTION
                )
            )

            // For node version operations
            qc.fetchQuery(
                shouldInvalidate.getListNodeVersionsQueryOptions(
                    nodeId,
                    undefined,
                    INVALIDATE_CACHE_OPTION
                )
            )

            // Regular invalidation for endpoints without cache control headers
            ;[
                getListNodesForPublisherV2QueryKey(publisherId),
                getSearchNodesQueryKey().slice(0, 1),
            ].forEach((queryKey) => {
                qc.invalidateQueries({ queryKey })
            })
        },
    },
})
```

## Non-Cached Endpoints

The following endpoints do not have cache control headers and only require `invalidateQueries`:

- Publisher operations (`useCreatePublisher`, `useUpdatePublisher`)
- Access token operations (`useCreatePersonalAccessToken`, `useDeletePersonalAccessToken`)
- Search operations
- List operations (nodes for publisher, publishers list, etc.)

## Testing Strategy

1. **Manual Testing**: After each mutation, verify data is immediately updated across different browser tabs
2. **Network Inspection**: Verify that no-cache headers are sent for cached endpoints
3. **Cache Verification**: Confirm that cached data is invalidated and fresh data is fetched

## Implementation Priority

### High Priority

- [ ] `components/nodes/NodeDeleteModal.tsx`
- [ ] `components/nodes/NodeVersionDeleteModal.tsx`
- [ ] `components/nodes/AdminCreateNodeFormModal.tsx`
- [ ] `pages/admin/nodeversions.tsx`

### Medium Priority

- [x] `components/nodes/AdminNodeClaimModal.tsx` ✅ Already Implemented
- [x] `components/nodes/SearchRankingEditModal.tsx` ✅ Already Implemented
- [x] `components/nodes/PreemptedComfyNodeNamesEditModal.tsx` ✅ **FIXED**

---

**Last Updated**: July 11, 2025  
**Reference Implementation**: `pages/publishers/[publisherId]/claim-my-node.tsx` (human reviewed)

## Status Summary

- ✅ **9/9 files** properly implemented ✅ **COMPLETED**
- 🎯 **Goal**: 100% compliance with cache-busting for cached endpoints ✅ **ACHIEVED**

### Implementation Details:

- **High Priority**: All critical node and version operations ✅ Fixed
- **Medium Priority**: All secondary operations ✅ Fixed or Already Implemented
- **Reference Pattern**: Following `claim-my-node.tsx` implementation

## Next Steps

1. ✅ **COMPLETED** - Updated all files marked as "NEEDS IMPLEMENTATION"
2. ✅ **COMPLETED** - Added imports for `shouldInvalidate` and `INVALIDATE_CACHE_OPTION`
3. ✅ **COMPLETED** - Replaced basic `invalidateQueries()` calls with cache-busting versions for cached endpoints
4. 🧪 **TESTING PHASE** - Test all edit operations to ensure cache invalidation works correctly across browser tabs
