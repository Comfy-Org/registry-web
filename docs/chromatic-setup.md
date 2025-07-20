# Chromatic Visual Testing Setup

This project uses [Chromatic](https://www.chromatic.com/) for visual testing and review of Storybook components.

## CI/CD Integration

We have set up GitHub Actions to automatically run Chromatic on:

- Every push to the `main` and `dev` branches
- Every pull request targeting these branches

### How It Works

1. The GitHub Action checks out the code
2. Installs dependencies using pnpm
3. Builds the Storybook static files
4. Publishes the Storybook to Chromatic for visual testing

## Running Chromatic Locally

If you want to run Chromatic locally, you can use:

```bash
# Using environment variable
export CHROMATIC_PROJECT_TOKEN=your_project_token
pnpm run chromatic

# Or pass the token directly
CHROMATIC_PROJECT_TOKEN=your_project_token pnpm run chromatic
```

## Configuring Chromatic

The Chromatic configuration is handled in two places:

1. **GitHub Actions Workflow** (`.github/workflows/chromatic.yml`):
    - Controls when Chromatic runs in CI
    - Sets options like auto-accepting changes on the main branch

2. **Package.json Script**:
    - Provides an easy way to run Chromatic locally

## Features

- **Visual Testing**: Detects visual changes in your components
- **UI Review**: Provides a platform for reviewing UI changes
- **Baseline Capture**: Captures baseline images of your components
- **Auto-accepting Changes**: Changes on the main branch are automatically accepted as new baselines

## Adding to GitHub Settings

To make the integration work, you need to add the `CHROMATIC_PROJECT_TOKEN` as a secret in your GitHub repository:

1. Go to your GitHub repository
2. Click on "Settings"
3. Click on "Secrets" in the left sidebar
4. Click on "Actions"
5. Click "New repository secret"
6. Name: `CHROMATIC_PROJECT_TOKEN`
7. Value: Your Chromatic project token
8. Click "Add secret"
