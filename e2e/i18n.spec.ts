import { test, expect } from '@playwright/test';

test.describe('i18n locale routing', () => {
  test('default locale es accesible sin prefijo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('/en muestra contenido en inglés', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByText(/Pokédex|Home/i).first()).toBeVisible();
  });

  test('/fr muestra contenido en francés', async ({ page }) => {
    await page.goto('/fr');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('/de muestra contenido en alemán', async ({ page }) => {
    await page.goto('/de');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  });

  test('/it muestra contenido en italiano', async ({ page }) => {
    await page.goto('/it');
    await expect(page.locator('html')).toHaveAttribute('lang', 'it');
  });

  test('sitemap incluye URLs de los 5 locales', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain('/en/');
    expect(body).toContain('/fr/');
    expect(body).toContain('/de/');
    expect(body).toContain('/it/');
  });
});
