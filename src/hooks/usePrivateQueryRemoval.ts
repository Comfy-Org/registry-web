import { hashKey, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'

// Removing a query cancels its request but does not update active QueryObservers.
// Hide mounted private views as well, until an explicit fresh read succeeds.
export function usePrivateQueryRemoval(queryKey: QueryKey) {
  const client = useQueryClient()
  const queryHash = hashKey(queryKey)
  const [blockedHash, setBlockedHash] = useState<string>()
  const setBlocked = useCallback(
    (blocked: boolean) => setBlockedHash(blocked ? queryHash : undefined),
    [queryHash]
  )
  useEffect(() => {
    // Navigating to another resource must perform its own authorized read.
    setBlockedHash(undefined)
    return client.getQueryCache().subscribe((event) => {
      if (
        event.type === 'removed' &&
        event.query.queryHash === queryHash &&
        // gcTime: 0 can collect an unused query during mounting; that is not revocation.
        event.query.getObserversCount() > 0
      ) {
        setBlockedHash(queryHash)
      }
    })
  }, [client, queryHash])
  return [blockedHash === queryHash, setBlocked] as const
}
