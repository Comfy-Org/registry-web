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

  // Note: sleep() will be available in future versions of Vercel Workflow
  // await sleep('5 seconds') // Pause without consuming resources

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

## Example Implementations

This project includes multiple workflow examples demonstrating different use cases:

> **Note:** The `sleep()` function is documented in Vercel Workflow but not yet exported in the current beta version (4.0.1-beta.3). The examples show where it would be used, but are currently implemented without actual delays until a future version exports this function.

### 1. Basic Workflow (`app/api/workflow-example/route.ts`)

A simple workflow demonstrating:

- Durable workflow function with `'use workflow'`
- Stateless step functions with `'use step'`
- Pattern for where `sleep()` will be used for delays
- Handling HTTP requests in Next.js API routes

**Test it:**

```bash
curl -X POST http://localhost:3000/api/workflow-example \
  -H "Content-Type: application/json" \
  -d '{"topic": "test workflow"}'
```

### 2. Delayed Notification Workflow (`app/api/workflow-notification-example/route.ts`)

Demonstrates a welcome notification system with follow-up:

- Immediate welcome notification upon user signup
- Delayed follow-up notification after a specified time
- Practical use of `sleep()` for time-based actions

**Use case:** Send a welcome email immediately, then a follow-up email after 1 day encouraging users to explore features.

**Test it:**

```bash
curl -X POST http://localhost:3000/api/workflow-notification-example \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "email": "user@example.com", "name": "John"}'
```

### 3. Approval Workflow (`app/api/workflow-approval-example/route.ts`)

Multi-step approval process for node submissions:

- Automated validation checks
- Admin notification for manual review
- Waiting for approval with `sleep()`
- Status updates based on approval decision

**Use case:** When a user submits a new custom node, automatically validate it, notify admins, wait for approval, and update the node status.

**Test it:**

```bash
curl -X POST http://localhost:3000/api/workflow-approval-example \
  -H "Content-Type: application/json" \
  -d '{"nodeId": "node123", "submitterId": "user456", "nodeName": "My Custom Node"}'
```

### 4. Batch Processing with Rate Limiting (`app/api/workflow-batch-processing-example/route.ts`)

Process large datasets in batches with delays:

- Process items in configurable batch sizes
- Use `sleep()` between batches to respect rate limits
- Generate processing summaries

**Use case:** Update Algolia search indices for multiple nodes without hitting API rate limits, or sync data from external sources.

**Test it:**

```bash
curl -X POST http://localhost:3000/api/workflow-batch-processing-example \
  -H "Content-Type: application/json" \
  -d '{"items": ["item1", "item2", "item3", "item4", "item5", "item6", "item7", "item8", "item9", "item10"]}'
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
