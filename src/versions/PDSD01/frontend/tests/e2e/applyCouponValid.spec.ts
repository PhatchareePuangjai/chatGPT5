import { test, expect } from '@playwright/test';

test('apply valid coupon shows success message', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Coupon code').fill('SAVE100');
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.getByRole('status')).toHaveText('ใช้คูปองสำเร็จ');
});

