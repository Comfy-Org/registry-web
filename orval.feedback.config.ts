import type { ConfigExternal } from 'orval'

// Generate only this feature from the target backend. The existing client includes
// newer, unrelated production APIs that are absent from this backend checkout.
export default {
  privateFeedback: {
    input: {
      target: '../registry-backend/openapi.yml',
      filters: {
        tags: ['PrivateFeedback', 'AdminScans'],
        schemas: [
          /^Feedback/,
          'VersionFeedbackStatus',
          'AdminNodeVersion',
          'AdminVersionList',
          'NodeVersion',
          'NodeVersionStatus',
          'ErrorResponse',
        ],
      },
    },
    output: {
      target: './src/api/feedback.generated.ts',
      client: 'react-query',
      prettier: true,
      override: {
        mutator: {
          path: './src/api/mutator/axios-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
} satisfies ConfigExternal
