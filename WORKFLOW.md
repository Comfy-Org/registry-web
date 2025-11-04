# Vercel Workflow Setup

This project now includes [Vercel Workflow](https://vercel.com/docs/workflow) for building durable, stateful operations that can pause, resume, and maintain state across deployments.

## Installation

Vercel Workflow has been added to this project:

```bash
bun i workflow
```

## Key Concepts

### Workflow Directive (`'use workflow'`)

Mark a function as a durable workflow that can pause and resume across deployments:

```typescript
async function myWorkflow() {
  'use workflow'

  const step1Result = await performStep1()
  await sleep(5000) // Pause without consuming resources
  const step2Result = await performStep2()

  return { step1Result, step2Result }
}
```

### Step Directive (`'use step'`)

Mark a function as a stateless step with automatic retries:

```typescript
async function callExternalAPI(data: string) {
  'use step'

  // This will automatically retry on failure
  const response = await fetch('https://api.example.com', {
    method: 'POST',
    body: JSON.stringify({ data }),
  })

  return response.json()
}
```

## Example Implementation

See `app/api/workflow-example/route.ts` for a complete working example that demonstrates:

- Durable workflow function with `'use workflow'`
- Stateless step functions with `'use step'`
- Using `sleep()` to pause without consuming resources
- Handling HTTP requests in Next.js API routes

### Testing the Example

```bash
# Start the development server
bun dev

# In another terminal, test the workflow endpoint
curl -X POST http://localhost:3000/api/workflow-example \
  -H "Content-Type: application/json" \
  -d '{"topic": "test workflow"}'
```

Expected response:

```json
{
  "topic": "test workflow",
  "processed": {
    "original": "test workflow",
    "processed": "TEST WORKFLOW",
    "length": 13
  },
  "summary": "Processed \"test workflow\" (13 chars) to \"TEST WORKFLOW\"",
  "timestamp": "2025-10-26T..."
}
```

## Use Cases

Vercel Workflow is ideal for:

- **Long-running operations**: Process data that takes minutes or hours
- **Multi-step processes**: Chain together multiple API calls or operations
- **Scheduled tasks**: Run operations at specific times with `sleep()`
- **External integrations**: Coordinate with third-party APIs with automatic retries
- **Background jobs**: Process work queues without blocking requests

## Features

- **Durability**: Workflows survive deployments and infrastructure failures
- **State management**: Automatic state persistence between steps
- **Automatic retries**: Steps retry on failure with exponential backoff
- **Observability**: Built-in monitoring through Vercel dashboard
- **Resource efficiency**: `sleep()` pauses without consuming compute resources

## Pricing (Beta)

Currently free during beta. Future pricing:

- **Workflow Storage**: $0.50 per 1 GB per month
- **Workflow Steps**: $25.00 per 1,000,000 steps
- Regular compute pricing still applies

## CLI Commands

The `workflow` package includes a CLI:

```bash
# Run workflow commands
workflow [command]

# Or use the short alias
wf [command]
```

## Best Practices

1. **Use `'use step'` for external calls**: Wrap API calls and external operations in step functions for automatic retry handling
2. **Keep workflows focused**: Break complex workflows into smaller, composable workflows
3. **Use `sleep()` wisely**: For time-based delays, use `sleep()` instead of `setTimeout()`
4. **Handle errors gracefully**: Implement proper error handling in step functions
5. **Monitor in production**: Use Vercel's dashboard to observe workflow execution

## Resources

- [Official Vercel Workflow Documentation](https://vercel.com/docs/workflow)
- [Example Implementation](./app/api/workflow-example/route.ts)
- [Vercel Workflow Package](https://www.npmjs.com/package/workflow)

## Integration with This Project

Vercel Workflow can be used in this registry application for:

- **Node version processing**: Process and validate new node versions asynchronously
- **Search indexing**: Update Algolia indices with retry logic
- **Publisher verification**: Handle multi-step publisher verification flows
- **Email notifications**: Send notification emails with retry logic
- **Batch operations**: Process bulk updates to nodes or publishers
- **Analytics processing**: Aggregate and process usage statistics
