# GitHub App Setup

This document describes how to set up a GitHub OAuth App for the Comfy Registry.

## Creating a GitHub OAuth App

1. Go to [GitHub Developer Settings - OAuth Apps](https://github.com/settings/applications/new)

2. Fill in the following details:
   - **Application name**: `Comfy Registry`
   - **Application description**: `Comfy-Org official GitHub app to verify user's GitHub account permissions for managing and claiming nodes`
   - **Homepage URL**: `https://registry.comfy.org/`
   - **Authorization callback URL**: `https://registry.comfy.org/api/auth/github/callback`

3. Click "Register application"

4. After creation, you'll receive:
   - **Client ID** - Add this to your environment variables as `GITHUB_CLIENT_ID`
   - **Client Secret** - Add this to your environment variables as `GITHUB_CLIENT_SECRET`

## Environment Variables

Add the following environment variables to your `.env` file:

```
GITHUB_CLIENT_ID="your_client_id_here"
GITHUB_CLIENT_SECRET="your_client_secret_here"
```

**For production deployment**, make sure to also add these environment variables to your Vercel project settings.

## Development Setup

For local development, you may want to create a separate OAuth app with:
- **Homepage URL**: `http://localhost:3000/`
- **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`

This ensures your local development environment doesn't interfere with the production app.
