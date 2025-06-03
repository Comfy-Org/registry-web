import { test, expect } from '@playwright/test';

test.describe('Nodes page', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the nodes page
    await page.goto('/nodes');
  });
  
  test('should navigate to nodes page', async ({ page }) => {
    // Page should have the correct title
    await expect(page).toHaveTitle(/Nodes/);
  });
  
  test('should display node cards', async ({ page }) => {
    // Wait for node cards to be visible
    await expect(page.locator('.node-card')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Node details', () => {
  test.beforeEach(async ({ page }) => {
    // Start at the nodes page
    await page.goto('/nodes');
  });
  
  test('should be able to navigate to a node detail page', async ({ page }) => {
    // Click on the first node card (if available)
    const nodeCard = page.locator('.node-card').first();
    
    // If a node card exists, click it and verify navigation
    if (await nodeCard.count() > 0) {
      const nodeId = await nodeCard.getAttribute('data-node-id');
      await nodeCard.click();
      
      // Should be on the node detail page
      await expect(page).toHaveURL(new RegExp(`/nodes/${nodeId}`));
    }
  });
});
