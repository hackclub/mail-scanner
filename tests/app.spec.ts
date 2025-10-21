import { test, expect } from '@playwright/test';

test.describe('Mail Scanner App', () => {
  test('should show API key modal on load', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Enter API Key')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your API key')).toBeVisible();
  });

  test('should allow entering API key', async ({ page }) => {
    await page.goto('/');
    const apiKeyInput = page.getByPlaceholder('Enter your API key');
    await apiKeyInput.fill('test-api-key');
    
    const startButton = page.getByRole('button', { name: 'Start Scanning' });
    await expect(startButton).toBeEnabled();
    
    await startButton.click();
    await expect(page.getByText('Enter API Key')).not.toBeVisible();
  });

  test('should display main UI elements after API key entry', async ({ page }) => {
    await page.goto('/');
    
    await page.getByPlaceholder('Enter your API key').fill('test-api-key');
    await page.getByRole('button', { name: 'Start Scanning' }).click();
    
    await expect(page.getByText('--')).toBeVisible();
    await expect(page.getByText('Ready to scan')).toBeVisible();
    await expect(page.getByText('Scan History')).toBeVisible();
    await expect(page.getByText('Change API Key')).toBeVisible();
  });

  test('should show proper layout on mobile', async ({ page, browserName }) => {
    test.skip(browserName !== 'mobile', 'Mobile-only test');
    
    await page.goto('/');
    await page.getByPlaceholder('Enter your API key').fill('test-api-key');
    await page.getByRole('button', { name: 'Start Scanning' }).click();
    
    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
    if (viewport) {
      expect(viewport.width).toBeLessThan(500);
    }
    
    await expect(page.getByText('--')).toBeVisible();
    await expect(page.getByText('Scan History')).toBeVisible();
  });

  test('should change API key', async ({ page }) => {
    await page.goto('/');
    
    await page.getByPlaceholder('Enter your API key').fill('test-api-key');
    await page.getByRole('button', { name: 'Start Scanning' }).click();
    
    await page.getByText('Change API Key').click();
    await expect(page.getByText('Enter API Key')).toBeVisible();
  });
});
