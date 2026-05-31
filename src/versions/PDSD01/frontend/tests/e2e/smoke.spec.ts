import { test, expect } from '@playwright/test';

test('smoke: loads app shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
});
