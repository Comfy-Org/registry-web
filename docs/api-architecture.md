# API Architecture

## Overview

The ComfyUI Registry Web application uses a modern API architecture built on top of auto-generated TypeScript clients and React Query for state management. The system is designed around a RESTful backend API with automatic type generation and caching.

## API Client Generation

### Generated Client (`src/api/generated.ts`)

- **Auto-generated from OpenAPI spec** using Orval
- Located at `${NEXT_PUBLIC_BACKEND_URL}/openapi`
- Regenerated with `bun run orval` when backend changes
- Provides TypeScript interfaces for all API models
- Includes React Query hooks for every endpoint

### Custom Axios Instance (`src/api/mutator/axios-instance.ts`)

- **Base configuration**: Uses `NEXT_PUBLIC_BACKEND_URL` environment variable
- **Parameter serialization**: Uses `qs` library with array format 'repeat'
- **Authentication**: Interceptor in `_app.tsx` adds Firebase JWT tokens
- **Custom instance function**: Wraps Axios with consistent error handling

## Key Components

### 1. API Models

Auto-generated TypeScript interfaces including:

- `APIKey`, `APIKeyWithPlaintext` - API key management
- `ActionJobResult` - Job processing results
- Node, Publisher, and User models
- Request/Response types for all endpoints

### 2. React Query Hooks

All API interactions use generated hooks:

- `useGetUser()` - Current user data
- `useGetNodes()` - Node listing with pagination
- `useGetPublisher()` - Publisher details
- Mutation hooks for create/update/delete operations

### 3. Authentication Integration

- Firebase JWT tokens automatically attached to requests
- Token caching in `sessionStorage` for offline scenarios
- Automatic token refresh handled by Firebase SDK

## Error Handling

### Retry Strategy

```typescript
retry: (failureCount, error: any) => {
  // Don't retry on 404s
  if (error?.response?.status === 404) return false

  // Retry up to 3 times for other errors
  return failureCount < 3
}
```

### Status Code Handling

- **404 errors**: No retry, immediate failure
- **401/403 errors**: Handled by authentication system
- **Other errors**: Retry up to 3 times with exponential backoff

## Usage Patterns

### 1. Data Fetching

```typescript
const { data: user, isLoading, error } = useGetUser({})
```

### 2. Mutations

```typescript
const createNodeMutation = useCreateNode({
  onSuccess: (data) => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  },
})
```

### 3. Pagination

```typescript
const { data: nodes } = useGetNodes({
  page: currentPage,
  limit: pageSize,
})
```

## Environment Variables

- `NEXT_PUBLIC_BACKEND_URL` - Backend API base URL (required)
- Firebase configuration variables for authentication

## Development Workflow

1. **Backend Changes**: Run `bun run orval` to regenerate client
2. **Type Safety**: All API calls are fully typed
3. **Testing**: Use generated hooks in Storybook stories
4. **Caching**: Automatic caching with React Query

## Benefits

- **Type Safety**: Full TypeScript support across API calls
- **Automatic Updates**: API client stays in sync with backend
- **Consistent Patterns**: All API calls follow same patterns
- **Built-in Caching**: React Query handles caching automatically
- **Error Handling**: Centralized error handling and retry logic
