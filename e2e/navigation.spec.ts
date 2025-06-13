import { expect, test } from '@playwright/test';

test.describe('Basic navigation', () => {
  test('should navigate to the home page', async ({ page }) => {
    // Start from the home page
    await page.goto('/');
    
    // The page should contain nodes logo
    await expect(page.getByRole('img', { name: /nodes/i })).toBeVisible();
  });
});

test.describe('Registry functionality', () => {
  test('should display registry nodes', async ({ page }) => {
    // Go to the registry page
    await page.goto('/');
    
    // Check that registry component renders
    await expect(page.locator('.registry-container')).toBeVisible();
  });
});
