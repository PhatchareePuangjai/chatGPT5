import { test, expect } from '@playwright/test';

test('checkout shows separate promotion discount line', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Cart').selectOption('c2000');
  await expect(page.getByRole('heading', { name: 'Summary' })).toBeVisible();
  await expect(page.getByText('10% cart discount')).toBeVisible();
});

