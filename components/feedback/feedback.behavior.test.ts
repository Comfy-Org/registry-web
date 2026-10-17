import { feedbackFixture } from './feedback.fixtures'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  feedbackBody,
  nextVisibleReadSeq,
  mergeFeedbackPages,
} from './feedback.behavior'

test('rejects empty and oversized replies without rejecting Unicode within the limit', () => {
  assert.equal(feedbackBody(' \n '), null)
  assert.equal(feedbackBody('x'.repeat(5001)), null)
  assert.equal(feedbackBody('😀'.repeat(5000)), '😀'.repeat(5000))
  assert.equal(
    feedbackBody(' <script>example</script> '),
    '<script>example</script>'
  )
})

test('reading the latest page never skips unseen earlier messages', () => {
  assert.equal(nextVisibleReadSeq(0, new Set([71, 72, 73])), 0)
  assert.equal(nextVisibleReadSeq(3, new Set([4, 5, 7])), 5)
  assert.equal(nextVisibleReadSeq(5, new Set([1, 2, 3, 4])), 5)
})

test('polling retains history and exposes gaps when more than one page arrives', () => {
  const page = (first: number, last: number) => {
    const result = feedbackFixture()
    result.messages = Array.from({ length: last - first + 1 }, (_, i) => ({
      ...result.messages[0],
      seq: first + i,
    }))
    result.next_before_seq = first > 1 ? first : null
    return result
  }
  const loaded = mergeFeedbackPages(page(1, 1), page(2, 31))
  const polled = mergeFeedbackPages(loaded, page(3, 32))
  assert.deepEqual(
    polled.messages.map((m) => m.seq),
    Array.from({ length: 32 }, (_, i) => i + 1)
  )
  assert.equal(polled.next_before_seq, null)
  const busy = mergeFeedbackPages(polled, page(43, 72))
  assert.equal(busy.next_before_seq, 43)
  const recovered = mergeFeedbackPages(page(13, 42), busy)
  assert.equal(recovered.messages.length, 72)
  assert.equal(recovered.next_before_seq, null)
})

test('history never merges across Publisher or thread identities', () => {
  const previous = feedbackFixture()
  for (const target of [
    { ...previous.target, publisher_id: 'new-publisher' },
    { ...previous.target, thread_id: 'different-thread' },
  ]) {
    const incoming = { ...feedbackFixture(), target, messages: [] }
    assert.deepEqual(mergeFeedbackPages(previous, incoming).messages, [])
  }
})
