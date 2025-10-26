/**
 * Test cases for batch utilities
 */

import { createBatchReasonMessage, generateBatchId } from './batchUtils'

describe('Batch Utilities', () => {
  // Test the generateBatchId function
  describe('generateBatchId', () => {
    it('should generate a hash from nodeId@version strings', () => {
      const testKeys = ['node123@1.0.0', 'node456@2.1.0', 'node789@0.1.0']
      const batchId = generateBatchId(testKeys)

      // Verify that the batch ID is a non-empty string
      expect(typeof batchId).toBe('string')
      expect(batchId.length).toBeGreaterThan(0)
    })

    it('should generate the same hash for the same input in different order', () => {
      const testKeys1 = ['node123@1.0.0', 'node456@2.1.0', 'node789@0.1.0']
      const testKeys2 = ['node456@2.1.0', 'node789@0.1.0', 'node123@1.0.0']

      // The batchId should be deterministic for the same set of keys, regardless of order
      const batchId1 = generateBatchId(testKeys1)
      const batchId2 = generateBatchId(testKeys2)
      expect(batchId1).toBe(batchId2)
    })
  })

  // Test the createBatchReasonMessage function
  describe('createBatchReasonMessage', () => {
    it('should append batch ID to the reason message', () => {
      const reason = 'Batch approved by admin'
      const batchId = '1a2b3c4d'
      const result = createBatchReasonMessage(reason, batchId)

      expect(result).toBe('Batch approved by admin [Batch: 1a2b3c4d]')
    })
  })
})
