import { test, expect } from '@playwright/test';

test('coupon usage limit message is displayed', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Coupon code').fill('WELCOME');
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.getByRole('status')).toHaveText('คุณใช้สิทธิ์ครบแล้ว');
});

