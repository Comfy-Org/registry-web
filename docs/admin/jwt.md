# Admin JWT Token Management - Implementation Plan

## Overview

Implement JWT admin token generation and management for admin operations that require JWT authentication (like ban/unban actions).

## Problem

The ban/unban endpoints require JWT admin tokens (signed with `JWT_SECRET`) instead of Firebase session tokens. Currently, admins cannot perform these operations from the web UI.

## Solution

Create a JWT token management system that:

1. Generates JWT admin tokens on-demand
2. Stores tokens in localStorage with expiration tracking
3. Automatically prompts for token generation when needed
4. Validates and refreshes expired tokens

## API Endpoint

**Endpoint:** `POST /admin/generate-token`

**Response:**

```typescript
{
  token: string; // JWT admin token
  expires_at: string; // ISO 8601 timestamp
}
```

**Hook:** `useGenerateAdminToken()`

## Implementation Tasks

### 1. Create JWT Token Storage Utility

**File:** `src/utils/adminJwtStorage.ts`

**Functions:**

- `getAdminJwtToken(): string | null` - Get current token from localStorage
- `setAdminJwtToken(token: string, expiresAt: string)` - Store token with expiration
- `isAdminJwtTokenValid(): boolean` - Check if token exists and not expired
- `clearAdminJwtToken()` - Remove token from localStorage

**localStorage key:** `admin_jwt_token`

**Storage format:**

```json
{
  "token": "eyJhbGci...",
  "expires_at": "2026-01-12T18:22:51Z"
}
```

### 2. Create JWT Admin Token Modal Component

**File:** `components/admin/AdminJwtTokenModal.tsx`

**Features:**

- Modal dialog for generating JWT tokens
- Shows token expiration time
- "Generate Token" button that calls `useGenerateAdminToken()`
- Success/error toast notifications
- Auto-closes on successful generation
- Export as reusable component

**Props:**

```typescript
interface AdminJwtTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenGenerated?: () => void;
}
```

### 3. Create Admin JWT Page

**File:** `pages/admin/jwt.tsx`

**Features:**

- Protected route (uses `withAdmin` HOC)
- Display current token status (valid/expired/missing)
- Show token expiration time if valid
- Button to generate new token
- Uses `AdminJwtTokenModal` component
- Copy token to clipboard functionality (optional)

**UI Elements:**

- Token status indicator (green/red/gray)
- Expiration timestamp display
- "Generate New Token" button
- Token preview (masked, with copy button)

### 4. Create Custom Hook for Admin Operations

**File:** `src/hooks/useAdminJwtToken.ts`

**Functions:**

- `useAdminJwtToken()` - Hook that returns:
  - `token: string | null`
  - `isValid: boolean`
  - `expiresAt: string | null`
  - `generateToken: () => Promise<void>`
  - `clearToken: () => void`
  - `showTokenModal: () => void`

### 5. Update Axios Instance to Use JWT Token

**File:** `src/api/mutator/axios-instance.ts`

**Changes:**

- Add interceptor to check request URL
- For ban/unban endpoints, use JWT admin token instead of Firebase token
- If JWT token is missing or expired, throw specific error

**Pseudo-code:**

```typescript
if (url.includes("/ban")) {
  const adminToken = getAdminJwtToken();
  if (adminToken && isAdminJwtTokenValid()) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else {
    // Will be caught by error handler
    throw new Error("ADMIN_JWT_REQUIRED");
  }
}
```

### 6. Integrate Modal into Ban Functionality

**File:** `pages/admin/nodes.tsx`

**Changes:**

- Add state for modal visibility
- Wrap ban/unban mutations with JWT token check
- If token missing/invalid, show modal
- After token generation, retry the ban/unban operation

**Flow:**

```
User clicks Ban
  → Check JWT token validity
  → If invalid: Show modal → Generate token → Retry ban
  → If valid: Execute ban directly
```

### 7. Add Link to JWT Page in Admin Dashboard

**File:** `pages/admin/index.tsx`

**Changes:**

- Add "Admin JWT Tokens" card/link to the admin dashboard
- Description: "Manage JWT tokens for admin operations"

## Testing Checklist

- [ ] JWT token is generated successfully
- [ ] Token is stored in localStorage with correct format
- [ ] Token expiration is validated correctly
- [ ] Modal opens when ban operation needs JWT token
- [ ] Ban operation succeeds after generating JWT token
- [ ] Unban operation works with JWT token
- [ ] Expired tokens are detected and regenerated
- [ ] Toast notifications show appropriate messages
- [ ] Admin JWT page displays token status correctly
- [ ] Modal can be manually triggered from JWT page
- [ ] Page refreshes don't lose stored tokens
- [ ] Non-admin users cannot access JWT page

## Security Considerations

- JWT tokens are short-lived (1 hour expiration)
- Tokens are only stored in localStorage, not sessionStorage
- Only admin users can generate tokens (Firebase auth check on backend)
- Tokens are only used for admin ban/unban operations
- Clear tokens on logout (future enhancement)

## Success Criteria

- [ ] Admins can ban nodes from the web UI
- [ ] Admins can unban nodes from the web UI
- [ ] Token generation is seamless and user-friendly
- [ ] Expired tokens are handled gracefully
- [ ] No security vulnerabilities introduced
- [ ] Code is well-documented and tested

## Future Enhancements

- Auto-refresh tokens before expiration
- Show token usage history
- Revoke tokens functionality
- Multiple token management (optional)
- Clear tokens on logout

## Timeline

1. Token storage utility: 30 min
2. Modal component: 1 hour
3. JWT page: 1 hour
4. Custom hook: 30 min
5. Axios interceptor: 1 hour
6. Integration with ban functionality: 1 hour
7. Testing and refinement: 1 hour

**Total estimated time:** 6 hours
