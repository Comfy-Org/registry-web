# Authentication System

## Overview

The application uses Firebase Authentication for user management with React Query integration for user data fetching. The system provides both basic authentication and admin role-based access control through Higher-Order Components (HOCs).

## Architecture Components

### 1. Firebase Configuration (`src/firebase.ts`)

```typescript
import { initializeApp } from 'firebase/app'
import 'firebase/auth'

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

const app = initializeApp(firebaseConfig)
export default app
```

### 2. Authentication Interceptor (`pages/_app.tsx`)

```typescript
// Add Firebase JWT token to every API request
AXIOS_INSTANCE.interceptors.request.use(async (config) => {
    const auth = getAuth(app)
    const user = auth.currentUser

    if (user) {
        const token = await user.getIdToken()
        sessionStorage.setItem('idToken', token)
        config.headers.Authorization = `Bearer ${token}`
    } else {
        const cachedIdtoken = sessionStorage.getItem('idToken') ?? ''
        if (cachedIdtoken) {
            config.headers.Authorization = `Bearer ${cachedIdtoken}`
        }
    }

    return config
})
```

## Authentication HOCs

### 1. Basic Authentication (`components/common/HOC/withAuth.tsx`)

```typescript
const withAuth = (WrappedComponent) => {
    const HOC = (props) => {
        const router = useRouter()
        const auth = getAuth(app)
        const [user, loading, error] = useAuthState(auth)
        const fromUrlParam = useFromUrlParam()

        useEffect(() => {
            if (!loading && !user) {
                router.push(`/auth/login?${fromUrlParam}`)
            }
        }, [router, user, loading, fromUrlParam])

        if (loading) return <Spinner />
        if (!user) return null

        return <WrappedComponent {...props} />
    }

    return HOC
}
```

### 2. Admin Authentication (`components/common/HOC/authAdmin.tsx`)

```typescript
const withAdmin = (WrappedComponent) => {
    const HOC = (props) => {
        const router = useRouter()
        const auth = getAuth()
        const fromUrlParam = useFromUrlParam()

        // Check Firebase authentication
        const [firebaseUser, firebaseUserLoading] = useAuthState(auth)

        // Check backend user data and admin status
        const { data: user, isLoading } = useGetUser({})

        useEffect(() => {
            if (!firebaseUserLoading && !firebaseUser) {
                router.push(`/auth/login?${fromUrlParam}`)
            }
        }, [router, firebaseUser, firebaseUserLoading, fromUrlParam])

        if (isLoading) return <Spinner />
        if (!user) return null

        if (!user.isAdmin) {
            return (
                <div className="text-white dark:text-white">
                    403 Forbidden: You have no permission to this page.
                </div>
            )
        }

        return <WrappedComponent {...props} />
    }

    return HOC
}
```

## Authentication Flow

### 1. Login Process

1. User navigates to protected route
2. `withAuth` HOC checks authentication state
3. If not authenticated, redirects to `/auth/login`
4. After successful login, redirects back to original route

### 2. Token Management

1. Firebase handles token generation and refresh
2. Axios interceptor attaches token to all API requests
3. Token cached in `sessionStorage` for offline scenarios
4. Automatic token refresh handled by Firebase SDK

### 3. Admin Access Control

1. Basic authentication check (Firebase)
2. Backend user data fetch via `useGetUser()`
3. Admin role verification (`user.isAdmin`)
4. 403 error display for non-admin users

## User State Management

### React Query Integration

```typescript
// Current user data
const { data: user, isLoading, error } = useGetUser({})

// User authentication state
const [firebaseUser, loading, error] = useAuthState(auth)
```

### State Flow

1. **Firebase User**: Authentication state from Firebase
2. **Backend User**: Full user profile from backend API
3. **Admin Status**: Role-based permissions from backend

## Route Protection

### Page-Level Protection

```typescript
// Basic authentication required
export default withAuth(MyPage)

// Admin authentication required
export default withAdmin(AdminPage)
```

### Component-Level Protection

```typescript
// Conditional rendering based on auth state
const { data: user } = useGetUser({})

if (!user) return <LoginPrompt />
if (!user.isAdmin) return <UnauthorizedMessage />

return <AdminContent />
```

## Authentication UI Components

### Login/Logout (`components/AuthUI/`)

- `AuthUI.tsx`: Login form and social auth
- `Logout.tsx`: Logout functionality

### Usage Example

```typescript
import { useAuthState } from 'react-firebase-hooks/auth'
import { getAuth } from 'firebase/auth'

const Header = () => {
    const [user] = useAuthState(getAuth(app))

    return (
        <header>
            {user ? (
                <ProfileDropdown user={user} />
            ) : (
                <LoginButton />
            )}
        </header>
    )
}
```

## Error Handling

### Authentication Errors

```typescript
// 401 Unauthorized
if (error?.response?.status === 401) {
    router.push('/auth/login')
}

// 403 Forbidden
if (error?.response?.status === 403) {
    return <div>403 Forbidden: Insufficient permissions</div>
}
```

### Network Errors

- Token refresh handled automatically by Firebase
- Cached tokens used when offline
- Graceful degradation for auth failures

## Security Features

### 1. Token Security

- **Short-lived tokens**: Firebase handles automatic refresh
- **Secure storage**: Tokens stored in memory, cached in sessionStorage
- **HTTPS only**: All authentication traffic over HTTPS

### 2. CSRF Protection

- **Bearer tokens**: JWT tokens in Authorization header
- **Origin validation**: Firebase handles origin validation
- **Secure cookies**: Firebase auth cookies marked secure

### 3. Role-Based Access

- **Server-side validation**: Backend validates admin roles
- **Client-side guards**: UI components respect user roles
- **Route protection**: HOCs prevent unauthorized access

## Environment Variables

### Required Variables

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

### Development vs Production

- **Development**: Firebase emulator support
- **Production**: Firebase production project
- **Testing**: Mock authentication in tests

## URL State Management

### Redirect Handling (`useFromUrl.tsx`)

```typescript
const useFromUrlParam = () => {
    const router = useRouter()
    const fromUrl = router.asPath

    return `from=${encodeURIComponent(fromUrl)}`
}
```

### Flow

1. User attempts to access protected route
2. Redirect to login with `?from=/protected/route`
3. After successful login, redirect back to original route

## Best Practices

### 1. HOC Usage

- Use `withAuth` for basic authentication
- Use `withAdmin` for admin-only pages
- Apply at page level for optimal performance

### 2. Error Handling

- Always handle loading states
- Provide meaningful error messages
- Implement graceful fallbacks

### 3. Token Management

- Let Firebase handle token refresh
- Don't manually manage token expiration
- Use cached tokens for offline scenarios

### 4. Security

- Never store sensitive data in localStorage
- Validate permissions on both client and server
- Use HTTPS in production

## Testing

### Authentication Mocking

```typescript
// Mock useAuthState hook
jest.mock('react-firebase-hooks/auth', () => ({
    useAuthState: jest.fn(() => [mockUser, false, null]),
}))

// Mock useGetUser hook
jest.mock('src/api/generated', () => ({
    useGetUser: jest.fn(() => ({ data: mockUser, isLoading: false })),
}))
```

### Testing Strategies

- **Unit tests**: Test HOCs with mocked auth state
- **Integration tests**: Test complete auth flow
- **E2E tests**: Test user journeys with real auth

## Common Issues and Solutions

### 1. Token Expiration

- **Problem**: API calls fail with 401 after token expiry
- **Solution**: Firebase automatically refreshes tokens

### 2. Redirect Loops

- **Problem**: Infinite redirects between login and protected routes
- **Solution**: Proper loading state handling in HOCs

### 3. Admin Access

- **Problem**: User has Firebase auth but not admin permissions
- **Solution**: Two-tier validation (Firebase + backend user data)

### 4. Cross-Tab Sync

- **Problem**: Login state not synced across browser tabs
- **Solution**: Firebase automatically syncs auth state across tabs
