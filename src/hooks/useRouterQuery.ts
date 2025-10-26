import { useRouter } from 'next/router'
import { filter, omit } from 'rambda'
import { useCallback } from 'react'

/**
 * A hook to easily access and update URL query parameters
 *
 * @returns [query, updateQuery] - Current query object and a function to update it
 *
 * @example
 * // Access query parameters
 * const [query, updateQuery] = useRouterQuery()
 * const page = Number(query.page) || 1
 * const search = query.search as string || ''
 *
 * // Update query parameters (preserves existing parameters)
 * updateQuery({ page: 2 })
 *
 * // Replace all query parameters
 * updateQuery({ newParam: 'value' }, true)
 *
 * // Remove a parameter by setting it to null or undefined
 * updateQuery({ existingParam: null })
 */
export function useRouterQuery<
  T extends Record<string, any> = Record<string, string | string[]>,
>() {
  const router = useRouter()

  // Cast router.query to the generic type with fallback to empty object
  const query = router.query as T

  /**
   * Update query parameters
   *
   * @param newParams - New parameters to add or update
   * @param replace - Whether to replace all existing parameters (default: false)
   * @param options - Additional options for router.push
   *
   * @remarks
   * - Parameters with null or undefined values will be omitted from the query
   * - This can be used to remove existing parameters by setting them to null
   */
  const updateQuery = useCallback(
    (newParams: Partial<T>, replace = false, options = { shallow: true }) => {
      // Filter out null and undefined values
      const filteredParams = filter((e) => e != null, newParams)

      // Prepare the final query object
      const finalQuery = replace
        ? filteredParams
        : {
            ...omit(Object.keys(newParams), router.query),
            ...filteredParams,
          }

      router.push(
        {
          pathname: router.pathname,
          query: finalQuery,
        },
        undefined,
        options
      )
    },
    [router]
  )

  return [query, updateQuery] as const
}
