import { test, expect } from '@playwright/test';

test('apply expired coupon shows expired message', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Coupon code').fill('EXPIRED');
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.getByRole('status')).toHaveText('คูปองหมดอายุ');
});

