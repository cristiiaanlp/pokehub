import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('carga el hero y las stats', async ({ page }) => {
    await page.goto('/');
    // Hero visible
    await expect(
      page.getByRole('heading', { level: 1 }).first()
    ).toBeVisible();
    // CTA principal
    await expect(
      page.getByRole('link', { name: /pokédex|pokedex/i }).first()
    ).toBeVisible();
    // Footer disclaimer (legal)
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('los CTAs llevan a las páginas correctas', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /pokédex|pokedex/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/pokedex/);
  });

  test('responde en menos de 3s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.getByRole('heading', { level: 1 }).first().waitFor();
    expect(Date.now() - start).toBeLessThan(3000);
  });
});
