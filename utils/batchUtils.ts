/**
 * Utilities for batch operations on node versions
 */

/**
 * Generates a simple hash from a string
 * @param str String to hash
 * @returns Hash as a hexadecimal string
 */
function simpleHash(str: string): string {
    let hash = 0

    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convert to 32bit integer
    }

    // Convert to unsigned and to hex string
    return (hash >>> 0).toString(16)
}

/**
 * Generates a batch ID hash from an array of nodeId@version strings
 * @param keys Array of nodeId@version strings
 * @returns A hash string that can be used as a batch ID
 */
export function generateBatchId(keys: string[]): string {
    // Sort to ensure consistent hash regardless of order
    const sortedKeys = [...keys].sort()
    const timestamp = new Date().toISOString()
    // Combine all keys with timestamp to create a unique hash
    const input = `${sortedKeys.join('|')}|${timestamp}`
    return simpleHash(input)
}

/**
 * Creates a batch reason message with the batch ID
 * @param originalReason Original reason message
 * @param batchId Batch ID hash
 * @returns A reason message with batch information
 */
export function createBatchReasonMessage(
    originalReason: string,
    batchId: string
): string {
    return `${originalReason} [Batch: ${batchId}]`
}
