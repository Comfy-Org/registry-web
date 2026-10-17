import type { ConfigExternal } from 'orval'

// Generate feedback and admin scan operations from the active Registry backend.
export default {
  privateFeedback: {
    input: {
      target: '../cloud/services/comfy-api/openapi.yml',
      override: {
        // Selected operations use schema refs only. Orval otherwise emits every
        // shared proxy response/parameter, even with operation/schema filters.
        transformer: (spec) => ({
          ...spec,
          components: { schemas: spec.components?.schemas },
        }),
      },
      filters: {
        tags: ['PrivateFeedback', 'AdminScans'],
        schemas: [
          /^Feedback/,
          'VersionFeedbackStatus',
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
