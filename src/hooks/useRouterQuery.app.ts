import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { filter, omit } from 'rambda'
import { useCallback } from 'react'

/**
 * A hook to easily access and update URL query parameters (App Router version)
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
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Convert URLSearchParams to object
  const query = Object.fromEntries(searchParams.entries()) as T

  /**
   * Update query parameters
   *
   * @param newParams - New parameters to add or update
   * @param replace - Whether to replace all existing parameters (default: false)
   *
   * @remarks
   * - Parameters with null or undefined values will be omitted from the query
   * - This can be used to remove existing parameters by setting them to null
   */
  const updateQuery = useCallback(
    (newParams: Partial<T>, replace = false) => {
      // Filter out null and undefined values
      const filteredParams = filter((e) => e != null, newParams)

      // Prepare the final query object
      const finalQuery = replace
        ? filteredParams
        : {
            ...omit(Object.keys(newParams), query),
            ...filteredParams,
          }

      // Build new URL search params
      const params = new URLSearchParams()
      Object.entries(finalQuery).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.set(key, String(value))
        }
      })

      // Navigate to new URL with updated query params
      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname

      router.push(newUrl)
    },
    [router, pathname, query]
  )

  return [query, updateQuery] as const
}
