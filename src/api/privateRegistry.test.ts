import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { QueryClient, dehydrate, isCancelledError } from '@tanstack/react-query'
import {
  isPrivateRegistryRequest,
  registryDehydrateOptions,
  shouldPersistRegistryQuery,
  usesAdminJwt,
  clearPrivateRegistryCache,
} from './privateRegistry'

describe('private Registry requests', () => {
  test('revocation aborts pending reads and prevents late responses from restoring private data', async () => {
    const client = new QueryClient()
    const scope = ['registry-private', 'owner', 'author']
    const key = [...scope, 'example', 'version']
    let finish!: (data: { body: string }) => void
    let signal!: AbortSignal
    const request = client
      .fetchQuery({
        queryKey: key,
        queryFn: (context) => {
          signal = context.signal
          return new Promise<{ body: string }>((resolve) => {
            finish = resolve
          })
        },
      })
      .catch((error: unknown) => error)
    client.setQueryData(['/nodes/example'], {
      tags_admin: ['any-code-execute'],
    })

    clearPrivateRegistryCache(client, scope)
    assert.equal(signal.aborted, true)
    assert.equal(isCancelledError(await request), true)
    finish({ body: 'Late private response' })
    await Promise.resolve()
    assert.equal(client.getQueryData(key), undefined)
    assert.deepEqual(client.getQueryData(['/nodes/example']), {
      tags_admin: ['any-code-execute'],
    })
    client.clear()
  })
  test('paused feedback mutations never persist their message bodies', () => {
    const client = new QueryClient()
    const mutation = client.getMutationCache().build(client, {
      mutationKey: ['registry-private', 'owner', 'write'],
      meta: { persist: false },
    })
    mutation.state = {
      ...mutation.state,
      status: 'pending',
      isPaused: true,
      variables: { body: 'Private draft' },
    }
    client.setQueryData(['/nodes/example'], { tags_admin: ['flagged'] })
    client.setQueryData(['registry-private', 'owner', 'thread'], {
      body: 'Private reply',
    })
    const snapshot = dehydrate(client, registryDehydrateOptions)
    assert.equal(snapshot.mutations.length, 0)
    assert.equal(snapshot.queries.length, 1)
    assert.equal(JSON.stringify(snapshot).includes('Private'), false)
    client.clear()
  })
  test('feedback writes use Firebase identity before the legacy admin JWT rule', () => {
    assert.equal(
      usesAdminJwt(
        'POST',
        '/admin/nodes/example/versions/uuid/feedback/messages'
      ),
      false
    )
    assert.equal(
      usesAdminJwt('PATCH', '/admin/nodes/example/versions/uuid/feedback'),
      false
    )
    assert.equal(
      usesAdminJwt('PUT', '/admin/nodes/example/versions/1.0.0'),
      true
    )
    assert.equal(usesAdminJwt('GET', '/nodes/bananaforge'), false)
    for (const path of [
      '/admin/nodes/feedback/versions/1.0.0',
      '/publishers/feedback/ban',
      '/publishers/p/nodes/feedback/ban',
    ]) {
      assert.equal(usesAdminJwt('POST', path), true, path)
    }
  })
  test('scan and feedback data are excluded from persistent caches', () => {
    for (const path of [
      '/admin/nodeversions',
      '/users/me/node-version-feedback',
      '/publishers/p/nodes/n/versions/v/feedback',
      '/publishers/feedback/nodes/feedback/versions/v/feedback?before_seq=4',
      '/publishers/p/nodes/n/versions/v/feedback/messages',
      '/publishers/p/nodes/n/versions/v/feedback/read',
    ]) {
      assert.equal(isPrivateRegistryRequest(path), true)
      assert.equal(
        shouldPersistRegistryQuery({
          queryKey: [path],
          state: { status: 'success' },
        }),
        false
      )
    }
    assert.equal(
      shouldPersistRegistryQuery({
        queryKey: ['registry-private', 'uid', 'thread'],
        state: { status: 'success' },
      }),
      false
    )
    assert.equal(
      shouldPersistRegistryQuery({
        queryKey: ['/nodes/x'],
        meta: { persist: false },
        state: { status: 'success' },
      }),
      false
    )
    assert.equal(
      shouldPersistRegistryQuery({
        queryKey: ['/nodes/x'],
        state: { status: 'success' },
      }),
      true
    )
    assert.equal(
      shouldPersistRegistryQuery({
        queryKey: ['/nodes/x'],
        state: { status: 'pending' },
      }),
      false
    )
  })
  test('public resources named feedback retain public authentication and caching', () => {
    for (const path of [
      '/nodes/feedback',
      '/nodes/feedback/install',
      '/nodes/feedback/versions/1.0.0',
      '/publishers/feedback',
      '/publishers/feedback/nodes',
    ]) {
      assert.equal(isPrivateRegistryRequest(path), false, path)
      assert.equal(
        shouldPersistRegistryQuery({
          queryKey: [path],
          state: { status: 'success' },
        }),
        true,
        path
      )
    }
  })
})
