import type { QueryClient, QueryKey } from '@tanstack/react-query'

// Private data must never be persisted or reused across authenticated identities.
export const PRIVATE_REGISTRY_KEY = 'registry-private'
export const PRIVATE_REGISTRY_CACHE_VERSION = 'private-feedback-v1'

// Match the operation's position, not a node or Publisher named "feedback".
const versionFeedbackPath =
  /^\/(?:admin\/nodes\/[^/]+|publishers\/[^/]+\/nodes\/[^/]+)\/versions\/[^/]+\/feedback(?:\/|$)/

export const privateQueryOptions = {
  meta: { persist: false },
  gcTime: 0,
  refetchInterval: 25000,
  refetchIntervalInBackground: false,
  retry: false,
} as const

export const privateMutationOptions = {
  meta: { persist: false },
  networkMode: 'always',
} as const

export function isPrivateRegistryAccessDenied(error: unknown): boolean {
  return [401, 403, 404].includes(
    (error as { response?: { status?: number } })?.response?.status ?? 0
  )
}

// The caller chooses the affected identity/resource prefix. React Query cancels
// pending reads when removing queries, preventing late responses from restoring data.
export function clearPrivateRegistryCache(
  client: QueryClient,
  queryKey: QueryKey
): void {
  client.removeQueries({ queryKey })
  client
    .getMutationCache()
    .findAll({ mutationKey: queryKey })
    .forEach((mutation) => client.getMutationCache().remove(mutation))
}

export function isPrivateRegistryRequest(url: string): boolean {
  const path = url.split('?')[0]
  return (
    path.startsWith('/admin/') ||
    path === '/users/me/node-version-feedback' ||
    versionFeedbackPath.test(path)
  )
}

export function usesAdminJwt(method: string, url: string): boolean {
  const path = url.split('?')[0]
  if (versionFeedbackPath.test(path)) return false
  return (
    method.toUpperCase() !== 'GET' &&
    (path.endsWith('/ban') ||
      (path.startsWith('/admin/') && !path.startsWith('/admin/generate-token')))
  )
}

export function isPrivateRegistryQuery(query: {
  queryKey: readonly unknown[]
  meta?: Record<string, unknown>
}): boolean {
  return (
    query.meta?.persist === false ||
    query.queryKey.some(
      (key) =>
        typeof key === 'string' &&
        (key === PRIVATE_REGISTRY_KEY || isPrivateRegistryRequest(key))
    )
  )
}

export function shouldPersistRegistryQuery(query: {
  queryKey: readonly unknown[]
  meta?: Record<string, unknown>
  state: { status: string }
}): boolean {
  return query.state.status === 'success' && !isPrivateRegistryQuery(query)
}

export const registryDehydrateOptions = {
  shouldDehydrateQuery: shouldPersistRegistryQuery,
  // Offline writes can contain private bodies; never store or replay them after login.
  shouldDehydrateMutation: () => false,
}
