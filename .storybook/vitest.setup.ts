import { setProjectAnnotations } from '@storybook/nextjs-vite'
import { beforeAll } from 'vitest'
import * as projectAnnotations from './preview'

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
const project = setProjectAnnotations([projectAnnotations])

beforeAll(project.beforeAll)

// Suppress spurious Vite HMR WebSocket teardown errors that occur when the
// browser test runner shuts down before the HMR client can cleanly close.
// Only ignores WebSocket-related errors; all other unhandled rejections propagate.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('WebSocket closed without opened')) {
      event.preventDefault()
    }
  })
}
