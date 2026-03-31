import { test, expect } from '@playwright/test';

test('home page loads successfully', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('h1')).toHaveText('Home');
  await expect(page.locator('p')).toHaveText('Welcome to PKU Mat.');
});

test('navigation links are visible', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
});
