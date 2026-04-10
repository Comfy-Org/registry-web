---
name: auto-e2e
description: Automated end-to-end testing and debugging using Playwright headed MCP. Use when debugging UI issues, testing authentication flows, verifying admin features like ban/unban actions, or when the user mentions visual testing, browser debugging, or E2E testing.
---

# Auto E2E Debugging with Playwright

This skill guides you through automated end-to-end testing and debugging using Playwright headed MCP.

## When to Use This Skill

Use this skill when you need to:

- Debug UI issues visually in a real browser
- Test user authentication flows
- Verify admin features like ban/unban actions
- Capture screenshots for documentation
- Test the full application stack with backend integration

## Steps

### 1. Start the Development Server

Start the Next.js development server in the background:

```bash
bun dev
```

Wait for the server to be ready (usually shows "Ready on http://localhost:3000").

### 2. Launch Playwright in Headed Mode

Use the Playwright MCP tool to navigate to the application:

```javascript
// Navigate to the login page
playwright_navigate({
  url: 'http://localhost:3000/auth/login',
  headless: false,
})
```

### 3. Login with Test Credentials

Use the test credentials to authenticate:

- **Username/Email**: [Check environment variables or test config]
- **Password**: [Check environment variables or test config]

Fill in the login form:

```javascript
// Fill username/email field
playwright_fill({
  selector: 'input[type="email"]', // or appropriate selector
  value: 'test@example.com',
})

// Fill password field
playwright_fill({
  selector: 'input[type="password"]',
  value: 'test_password',
})

// Click login button
playwright_click({
  selector: 'button[type="submit"]',
})
```

### 4. Navigate and Test Features

Once logged in, you can:

- Navigate to admin panels: `http://localhost:3000/admin`
- Test node management features
- Test ban/unban actions on the nodes dashboard
- Capture screenshots of any issues

```javascript
// Take a screenshot
playwright_screenshot({
  name: 'admin-dashboard',
  fullPage: true,
  savePng: true,
})

// Get console logs to check for errors
playwright_console_logs({
  type: 'error',
})
```

### 5. Clean Up

When done testing:

```javascript
// Close the browser
playwright_close()
```

## Tips

- **Check for test credentials**: Look in `.env.local`, `.env.test`, or test configuration files
- **Watch console logs**: Monitor browser console for errors during testing
- **Network inspection**: Check network logs for failed API calls
- **Take screenshots**: Capture the state at different steps for debugging
- **Full page screenshots**: Use `fullPage: true` to capture long pages

## Common Test Scenarios

### Testing Admin Ban/Unban

1. Login as an admin user
2. Navigate to `/admin/nodes` or node details page
3. Locate the ban/unban button
4. Click and verify the action completes
5. Check UI updates and console logs

### Testing Authentication Flow

1. Navigate to `/auth/login`
2. Enter credentials
3. Submit form
4. Verify redirect to dashboard
5. Check auth state in console

### Testing Search Features

1. Navigate to home page
2. Use search bar
3. Verify Algolia results
4. Test autocomplete
5. Check search performance
