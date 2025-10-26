# Update PR Branches Workflow

## Overview

The "Update PR Branches to Latest Main" workflow allows maintainers to automatically update open pull request branches with the latest changes from the `main` branch. This helps keep PRs up-to-date and reduces merge conflicts.

## When to Use

- When `main` branch has significant updates and you want all open PRs to be current
- Before merging long-running PRs that might have fallen behind
- As part of regular repository maintenance

## How to Run

### Via GitHub UI

1. Go to the [Actions tab](../../actions/workflows/update-pr-branches.yml) in the repository
2. Click on "Update PR Branches to Latest Main" workflow
3. Click the "Run workflow" button
4. Configure options:
    - **PR numbers**: Leave empty to update all open PRs, or specify comma-separated PR numbers (e.g., `220,224,226`)
    - **Dry run**: Check this to see what would be updated without making changes
5. Click "Run workflow"

### Via GitHub CLI

Update all open PRs:

```bash
gh workflow run update-pr-branches.yml
```

Update specific PRs:

```bash
gh workflow run update-pr-branches.yml -f pr_numbers="220,224,226"
```

Dry run mode:

```bash
gh workflow run update-pr-branches.yml -f dry_run=true
```

## What the Workflow Does

For each PR (or specified PRs):

1. **Checks PR status**: Skips closed PRs
2. **Verifies branch exists**: Ensures the PR branch is accessible
3. **Checks if up-to-date**: Skips if already current with main
4. **Detects merge conflicts**: Tests merge and reports conflicts
5. **Merges main branch**: Updates PR branch with latest main
6. **Pushes changes**: Pushes updated branch back to GitHub
7. **Comments on PR**: Adds comment confirming the update

## Handling Conflicts

If the workflow detects merge conflicts:

- The merge is aborted automatically
- A comment is added to the PR noting manual intervention is needed
- The PR author should:
    1. Pull latest changes from main
    2. Resolve conflicts locally
    3. Push the resolved changes

## Limitations

- **Protected branches**: Cannot push to branches with strict protection rules
- **Forked repositories**: Cannot update PRs from forks (different repository)
- **Draft PRs**: Updates all open PRs including drafts
- **Permissions**: Requires write access to repository and PRs

## Best Practices

1. **Use dry run first**: Test with dry run mode before actual updates
2. **Update specific PRs**: When possible, target specific PRs rather than all
3. **Communicate**: Let PR authors know you're updating their branches
4. **Monitor results**: Check workflow logs to see which PRs were updated
5. **Handle conflicts promptly**: Address any reported conflicts quickly

## Troubleshooting

### Workflow fails with permission error

- Check that `GITHUB_TOKEN` has write permissions
- Verify branch protection rules allow GitHub Actions to push

### PR not updated

- Check workflow logs for specific error messages
- Verify PR is in OPEN state
- Ensure branch exists and is accessible
- Check for merge conflicts reported in comments

### Push fails

- Branch may have protection rules preventing push
- PR might be from a forked repository
- Network issues or rate limiting

## Security Considerations

- Workflow uses built-in `GITHUB_TOKEN` - no additional secrets needed
- Only repository collaborators can trigger the workflow
- Branch protection rules are respected
- All actions are logged and auditable

## Examples

### Example 1: Update all open PRs

```bash
gh workflow run update-pr-branches.yml
```

### Example 2: Update specific PRs (220, 224, 226)

```bash
gh workflow run update-pr-branches.yml -f pr_numbers="220,224,226"
```

### Example 3: Dry run to see what would be updated

```bash
gh workflow run update-pr-branches.yml -f dry_run=true
```

## Related Workflows

- **api-gen.yml**: Automatically updates API type definitions
- **react-ci.yml**: Runs CI checks on PRs
- **unit-test.yml**: Runs unit tests on PRs

## Future Enhancements

Potential improvements for this workflow:

- [ ] Add option to auto-merge PRs that are ready and pass checks
- [ ] Support for updating PRs based on labels
- [ ] Slack/Discord notifications for update results
- [ ] Automatic conflict resolution for simple conflicts
- [ ] Schedule option to run weekly/monthly
