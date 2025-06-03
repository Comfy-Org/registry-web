import { expect, test } from '@playwright/test';

test.describe('Authentication page', () => {
  test('should display the sign in page', async ({ page }) => {
    // Navigate to the auth page
    await page.goto('/auth/signin');
    
    // Check for the sign in header
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    
    // Check for Comfy Logo
    await expect(page.getByAltText('Comfy Logo')).toBeVisible();
  });
  
  test('should have Google sign in button', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Verify Google sign in button exists
    const googleButton = page.getByText('Continue with Google');
    await expect(googleButton).toBeVisible();
  });
  
  test('should have GitHub sign in button', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Verify GitHub sign in button exists
    const githubButton = page.getByText('Continue with GitHub');
    await expect(githubButton).toBeVisible();
  });
});

test.describe('Authentication redirection', () => {
  test('should redirect to login when accessing protected page', async ({ page }) => {
    // Try to access a protected page
    await page.goto('/publishers/me');
    
    // Should be redirected to login page
    await expect(page).toHaveURL(/.*auth\/signin/);
  });
  
  test('should redirect back to original page after login', async ({ page }) => {
    // This test doesn't actually perform login, as that would require real credentials
    // Instead, we check that the fromUrl parameter is correctly added to the URL
    
    // Try to access a protected page
    await page.goto('/publishers/me');
    
    // Should be redirected to login page with fromUrl parameter
    await expect(page.url()).toContain('fromUrl=');
  });
});

// These tests would require auth mocking which would be more complex
// Mock tests that would be useful to implement with proper auth mocking:
// test('should successfully log in with Google and redirect to home')
// test('should successfully log in with GitHub and redirect to home')
// test('should display error message for failed login')