# Caching Strategy

## Overview

The application implements a multi-layered caching strategy combining React Query's in-memory caching with localStorage persistence, plus deployment-based cache invalidation. This ensures optimal performance while maintaining data freshness.

## Cache Layers

### 1. In-Memory Cache (React Query)

- **Primary cache**: Stores query results in memory
- **Duration**: Configurable per query
- **Invalidation**: Automatic on mutations, manual via `queryClient.invalidateQueries()`
- **Garbage collection**: Unused queries cleaned up automatically

### 2. Persistent Cache (localStorage)

- **Storage**: Browser's localStorage
- **Key**: `comfy-registry-cache`
- **Duration**: 24 hours maximum
- **Sync**: Shared across browser tabs
- **Hydration**: Automatic on app startup

### 3. Deployment-Based Cache Busting

- **Buster**: Uses `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`
- **Fallback**: `'v1'` for local development
- **Effect**: Forces cache invalidation on new deployments

## Cache Configuration

### Persistence Setup (`pages/_app.tsx`)

```typescript
const persistEffect = () => {
  const [unsubscribe] = persistQueryClient({
    queryClient: queryClient,
    persister: createSyncStoragePersister({
      storage: window.localStorage,
      key: "comfy-registry-cache",
    }),
    dehydrateOptions: {
      shouldDehydrateQuery: ({ queryKey, state }) => {
        // Don't persist pending queries as they can't be properly restored
        if (state.status === "pending") return false;

        // Persist all successful queries
        return true;
      },
    },
    maxAge: 86400e3, // 1 day in milliseconds
    buster: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "v1",
  });
  return unsubscribe;
};
```

### Query Client Defaults

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 404s
        if (error?.response?.status === 404) return false;
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
    },
  },
});
```

## Cache Invalidation Strategies

### 1. Mutation-Based Invalidation

```typescript
const updateNodeMutation = useUpdateNode({
  onSuccess: (updatedNode) => {
    // Invalidate specific node
    queryClient.invalidateQueries(["node", updatedNode.id]);

    // Invalidate node lists
    queryClient.invalidateQueries(["nodes"]);

    // Invalidate publisher nodes if applicable
    if (updatedNode.publisherId) {
      queryClient.invalidateQueries(["publisher", updatedNode.publisherId, "nodes"]);
    }
  },
});
```

### 2. Time-Based Invalidation

```typescript
const { data: nodes } = useGetNodes({
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### 3. Manual Invalidation

```typescript
// Invalidate all queries
queryClient.invalidateQueries();

// Invalidate specific query pattern
queryClient.invalidateQueries(["nodes"]);

// Invalidate and refetch immediately
queryClient.invalidateQueries(["user"], { refetchActive: true });
```

## Cache Key Patterns

### Hierarchical Structure

```typescript
// User data
["user"][("user", userId)][ // Current user // Specific user
  // Nodes
  "nodes"
][("nodes", { page, limit, search })][("node", nodeId)][("node", nodeId, "versions")][ // All nodes list // Paginated nodes // Specific node // Node versions
  // Publishers
  "publishers"
][("publisher", publisherId)][("publisher", publisherId, "nodes")]; // All publishers // Specific publisher // Publisher's nodes
```

### Query Key Generation

Auto-generated hooks use consistent key patterns:

```typescript
// Generated query keys
queryKey: ["user"];
queryKey: ["nodes", params];
queryKey: ["node", nodeId];
queryKey: ["publisher", publisherId, "nodes", params];
```

## Performance Optimizations

### 1. Selective Persistence

- **Include**: Successful queries only
- **Exclude**: Pending/loading states
- **Exclude**: Error states
- **Exclude**: Mutations

### 2. Smart Dehydration

```typescript
shouldDehydrateQuery: ({ queryKey, state }) => {
  // Don't persist pending queries
  if (state.status === "pending") return false;

  // Persist successful queries
  if (state.status === "success") return true;

  // Don't persist errors
  return false;
};
```

### 3. Memory Management

- **Automatic cleanup**: Unused queries garbage collected
- **Cache time limits**: Configurable per query
- **Tab synchronization**: Shared localStorage across tabs

## Cache Monitoring

### Development Tools

- **React Query Devtools**: Available in development mode
- **Cache inspection**: View current cache state
- **Query tracking**: Monitor query lifecycle

### Cache Metrics

- **Hit rate**: Percentage of queries served from cache
- **Miss rate**: Queries requiring network requests
- **Invalidation frequency**: How often cache is invalidated

## Best Practices

### 1. Cache-First Strategy

```typescript
const { data } = useGetNodes({
  staleTime: 5 * 60 * 1000, // Serve from cache for 5 minutes
  cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
});
```

### 2. Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: updateNode,
  onMutate: async (newNode) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(["node", newNode.id]);

    // Snapshot previous value
    const previousNode = queryClient.getQueryData(["node", newNode.id]);

    // Optimistically update
    queryClient.setQueryData(["node", newNode.id], newNode);

    return { previousNode };
  },
  onError: (err, newNode, context) => {
    // Rollback on error
    queryClient.setQueryData(["node", newNode.id], context.previousNode);
  },
  onSettled: (data, error, variables) => {
    // Refetch after mutation
    queryClient.invalidateQueries(["node", variables.id]);
  },
});
```

### 3. Prefetching

```typescript
// Prefetch related data
const prefetchNodeVersions = (nodeId: string) => {
  queryClient.prefetchQuery(["node", nodeId, "versions"], () => getNodeVersions(nodeId));
};
```

### 4. Background Updates

```typescript
const { data } = useGetNodes({
  refetchOnWindowFocus: true,
  refetchOnMount: true,
  refetchOnReconnect: true,
});
```

## Cache Debugging

### Common Issues

1. **Stale data**: Check `staleTime` configuration
2. **Over-fetching**: Verify cache keys and invalidation logic
3. **Memory leaks**: Monitor cache size and cleanup
4. **Cross-tab sync**: Ensure localStorage persistence is working

### Debugging Tools

```typescript
// Check cache state
console.log(queryClient.getQueryCache().getAll());

// Monitor specific query
console.log(queryClient.getQueryData(["user"]));

// Check cache stats
console.log(queryClient.getQueryCache().findAll());
```

## Environment Considerations

### Development

- **Cache buster**: `'v1'` fallback
- **Debug mode**: React Query devtools enabled
- **Hot reloading**: Cache persists across HMR

### Production

- **Cache buster**: Git commit SHA
- **Persistence**: Full localStorage caching
- **Performance**: Optimized cache strategies

### Testing

- **Disabled persistence**: Testing uses separate query client
- **No retry**: Mutations and queries don't retry in tests
- **Isolated state**: Each test has clean cache state
