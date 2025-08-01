# React Query Integration

## Overview

The application uses TanStack Query (React Query) for server state management, providing automatic caching, background updates, and optimistic updates. The integration is set up at the application level with comprehensive caching strategies.

## Query Client Configuration

### Setup (`pages/_app.tsx`)

```typescript
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error: any) => {
                // Don't retry on 404s
                if (error?.response?.status === 404) return false
                // Retry up to 3 times for other errors
                return failureCount < 3
            },
        },
    },
})
```

### Provider Wrapping

```typescript
<QueryClientProvider client={queryClient}>
    <FlowBiteThemeProvider>
        <Layout>
            <Component {...pageProps} />
        </Layout>
    </FlowBiteThemeProvider>
</QueryClientProvider>
```

## Generated Hooks

### Auto-Generated from OpenAPI

All API hooks are generated by Orval from the backend OpenAPI specification:

- **Query hooks**: `useGetUser`, `useGetNodes`, `useGetPublisher`, etc.
- **Mutation hooks**: `useCreateNode`, `useUpdatePublisher`, `useDeleteNode`, etc.
- **Infinite query hooks**: For paginated data with infinite scroll

### Hook Types

```typescript
// Query hook structure
export const useGetUser = (options?: UseQueryOptions<User, Error>) => {
    return useQuery<User, Error>({
        queryKey: ['user'],
        queryFn: () => getUser(),
        ...options,
    })
}

// Mutation hook structure
export const useCreateNode = (
    options?: UseMutationOptions<Node, Error, CreateNodeRequest>
) => {
    return useMutation<Node, Error, CreateNodeRequest>({
        mutationFn: createNode,
        ...options,
    })
}
```

## Caching Strategy

### Persistence Configuration

```typescript
const persistEffect = () => {
    const [unsubscribe] = persistQueryClient({
        queryClient: queryClient,
        persister: createSyncStoragePersister({
            storage: window.localStorage,
            key: 'comfy-registry-cache',
        }),
        dehydrateOptions: {
            shouldDehydrateQuery: ({ queryKey, state }) => {
                // Don't persist pending queries
                if (state.status === 'pending') return false
                // Persist all other queries
                return true
            },
        },
        maxAge: 86400e3, // 1 day
        buster: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? 'v1',
    })
    return unsubscribe
}
```

### Cache Invalidation

- **Deployment-based**: Uses Vercel commit SHA as cache buster
- **Time-based**: 24-hour cache expiration
- **Manual**: Invalidation through mutation success callbacks

## Common Usage Patterns

### 1. Basic Data Fetching

```typescript
const { data: user, isLoading, error } = useGetUser({})

if (isLoading) return <Spinner />
if (error) return <div>Error: {error.message}</div>
if (!user) return <div>No user found</div>

return <UserProfile user={user} />
```

### 2. Mutations with Optimistic Updates

```typescript
const updateNodeMutation = useUpdateNode({
    onSuccess: (updatedNode) => {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries(['nodes'])
        queryClient.invalidateQueries(['node', updatedNode.id])
    },
    onError: (error) => {
        // Handle error state
        toast.error('Failed to update node')
    },
})
```

### 3. Dependent Queries

```typescript
const { data: user } = useGetUser({})
const { data: userNodes } = useGetUserNodes(
    { userId: user?.id },
    { enabled: !!user?.id } // Only run when user ID is available
)
```

### 4. Pagination

```typescript
const [page, setPage] = useState(1)
const { data: nodesResponse } = useGetNodes({
    page,
    limit: 20,
})

const { nodes, totalPages } = nodesResponse || {}
```

## Error Handling

### Global Error Handling

- **404 errors**: No retry, immediate failure
- **Network errors**: Retry up to 3 times
- **Authentication errors**: Handled by auth interceptor

### Component-Level Error Handling

```typescript
const { data, error, isError } = useGetNodes({
    onError: (error) => {
        if (error.response?.status === 403) {
            router.push('/auth/login')
        }
    },
})
```

## Background Updates

### Stale-While-Revalidate

React Query automatically refetches data in the background when:

- Window regains focus
- Component remounts
- Network reconnects
- Manual refetch is triggered

### Configuration

```typescript
const { data } = useGetNodes({
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
})
```

## Performance Optimizations

### Query Key Standardization

- Consistent query key patterns across the application
- Hierarchical keys for easy invalidation
- Parameterized keys for dynamic queries

### Selective Caching

- Only cache successful queries
- Exclude pending queries from persistence
- Smart cache invalidation based on data relationships

### Memory Management

- Automatic garbage collection of unused queries
- Configurable cache time limits
- Efficient data structure for large datasets

## Testing with Storybook

### Global Query Client Configuration

React Query is now configured globally in Storybook's `preview.tsx` file using decorators. This means all stories automatically have access to a QueryClient without needing individual wrapper components.

```typescript
// .storybook/preview.tsx
const preview: Preview = {
    decorators: [
        (Story) => {
            const queryClient = new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: false,
                        staleTime: 0,
                    },
                },
            })
            return (
                <QueryClientProvider client={queryClient}>
                    <Story />
                </QueryClientProvider>
            )
        },
    ],
}
```

### Story Integration

With the global configuration, stories no longer need to manually wrap components:

```typescript
export default {
    title: 'Components/NodeDetails',
    component: NodeDetails,
    // No decorators needed - QueryClient is provided globally
}
    ],
}
```

## Best Practices

1. **Use generated hooks**: Always use auto-generated hooks from `src/api/generated.ts`
2. **Handle loading states**: Provide appropriate loading indicators
3. **Error boundaries**: Implement error boundaries for query failures
4. **Optimistic updates**: Use optimistic updates for better UX
5. **Cache invalidation**: Properly invalidate related queries after mutations
6. **Query keys**: Use consistent, hierarchical query key patterns
