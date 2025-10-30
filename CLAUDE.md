# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development

- `bun install` - Install dependencies
- `bun dev` - Start Next.js development server on port 3000
- `bun build` - Build the production application
- `bun start` - Start the production server
- `bun test` - Run tests with coverage using Vitest

### Code Quality

- `bun run lint` - Run ESLint
- `bun run fix` - Run ESLint with --fix
- `bun run format` - Check Prettier formatting
- `bun run fmt` - Fix formatting with Prettier

### API & Code Generation

- `bun run orval` - Generate React Query hooks from OpenAPI spec
- `bun scripts/scan-i18n.ts` - Extract and update translation keys

### Storybook

- `bun run storybook` - Run Storybook development server on port 6006
- `bun run build-storybook` - Build Storybook for production
- `bun run chromatic` - Run Chromatic visual testing (requires CHROMATIC_PROJECT_TOKEN)

### Vercel Workflow

- `workflow` or `wf` - Vercel Workflow CLI for managing durable workflows
- See `pages/api/workflow-example.ts` for example implementation

## Architecture Overview

### Tech Stack

- **Frontend**: Next.js 15 with React 18.2, TypeScript, Tailwind CSS
- **UI Components**: Flowbite React components
- **State Management**: TanStack Query (React Query) for server state
- **API**: Auto-generated from OpenAPI spec using Orval
- **Search**: Algolia InstantSearch with autocomplete
- **Internationalization**: react-i18next with 7 supported languages
- **Authentication**: Firebase Auth
- **Testing**: Vitest with Playwright browser testing
- **Component Development**: Storybook with Chromatic visual testing
- **Workflows**: Vercel Workflow for durable, stateful operations

### Project Structure

- `pages/` - Next.js pages (App Router not used)
- `pages/api/` - Next.js API routes including Workflow examples
- `components/` - Reusable React components organized by feature
- `src/api/` - Auto-generated API client and custom Axios instance
- `src/hooks/` - Custom React hooks including i18n
- `src/stories/` - Storybook stories and documentation
- `public/locales/` - Translation files for supported languages
- `utils/` - Utility functions and theme configuration

### Key Features

- **Node Registry**: Browse, search, and manage ComfyUI custom nodes
- **Publisher Management**: Create and manage node publishers
- **Admin Panel**: Admin-only features for node management
- **Search & Discovery**: Algolia-powered search with autocomplete
- **Multilingual**: Support for English, Chinese, Japanese, French, Spanish, Korean, Russian
- **Authentication**: Firebase-based user authentication
- **API Keys**: Personal access token management

## Development Guidelines

### API Integration

- API client is auto-generated from OpenAPI spec at `${NEXT_PUBLIC_BACKEND_URL}/openapi`
- Use `bun run orval` to regenerate API client when backend changes
- All API calls use React Query hooks from `src/api/generated.ts`
- Custom Axios instance in `src/api/mutator/axios-instance.ts` handles authentication

### Internationalization

- All user-facing text must use the `t()` function from `useNextTranslation` hook
- Use English text as translation keys for readability
- Run `bun scripts/scan-i18n.ts` to extract new translation keys
- New languages require updating `SUPPORTED_LANGUAGES` in `src/constants.ts`

### Component Development

- Use Flowbite React components for UI consistency
- Custom theme configuration in `utils/comfyTheme.tsx`
- Storybook stories required for all shared components
- Follow existing patterns in component organization

### Authentication

- Firebase Auth integration via `src/firebase.ts`
- Use `withAuth` HOC for protected routes
- `authAdmin` HOC for admin-only components
- Access tokens managed through dedicated components

### Search Implementation

- Algolia InstantSearch with custom configuration
- Search index: `nodes_index`
- Query suggestions: `nodes_index_query_suggestions`
- Autocomplete plugin with recent searches

### Testing

- Vitest for unit tests with browser testing via Playwright
- Storybook stories serve as component documentation and testing
- Chromatic for visual regression testing
- Run `bun test` for full test suite

### Vercel Workflow

- Vercel Workflow enables durable, stateful operations that can pause and resume
- Use `'use workflow'` directive to mark functions as durable workflows
- Use `'use step'` directive for stateless functions with automatic retries
- Workflows maintain state across deployments and provide built-in observability
- Example implementation available in `pages/api/workflow-example.ts`
- See [Vercel Workflow Documentation](https://vercel.com/docs/workflow) for details

## Environment Variables

- `NEXT_PUBLIC_BACKEND_URL` - Backend API URL (required for orval)
- `CHROMATIC_PROJECT_TOKEN` - For Chromatic visual testing
- `OPENAI_API_KEY` - For automatic translation generation

## Common Issues

- After backend API changes, regenerate client with `bun run orval`
- For i18n issues, check translation keys exist in all locale files
- Storybook build issues often require clearing .storybook cache
- Authentication issues may require Firebase configuration updates
