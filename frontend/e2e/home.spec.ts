import { test, expect } from '@playwright/test';

test('login page loads and shows form', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('h1')).toHaveText('PKU-MAT');
  await expect(page.getByLabel('Nazwa uzytkownika')).toBeVisible();
  await expect(page.getByLabel('Haslo')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zaloguj sie' })).toBeVisible();
});

test('login as OSDp contractor redirects to dashboard', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Nazwa uzytkownika').fill('osdp_user');
  await page.getByLabel('Haslo').fill('haslo123');
  await page.getByRole('button', { name: 'Zaloguj sie' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
});

test('login as Wytworca contractor redirects to dashboard', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Nazwa uzytkownika').fill('wyt_user');
  await page.getByLabel('Haslo').fill('haslo123');
  await page.getByRole('button', { name: 'Zaloguj sie' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
});

test('login with wrong password shows error', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Nazwa uzytkownika').fill('osdp_user');
  await page.getByLabel('Haslo').fill('wrong');
  await page.getByRole('button', { name: 'Zaloguj sie' }).click();

  await expect(page.locator('.form-error-banner')).toHaveText('Nieprawidlowy login lub haslo');
});
