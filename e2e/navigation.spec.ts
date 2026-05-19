import { test, expect } from '@playwright/test';

test.describe('Navegación principal', () => {
  test('/pokedex carga y muestra Pokémon', async ({ page }) => {
    await page.goto('/pokedex');
    await expect(page).toHaveURL(/\/pokedex/);
    // Espera que haya al menos un Pokémon renderizado
    await page.waitForLoadState('networkidle');
  });

  test('/team-builder carga el constructor', async ({ page }) => {
    await page.goto('/team-builder');
    await expect(page).toHaveURL(/\/team-builder/);
  });

  test('/tools/damage-calc carga la calculadora', async ({ page }) => {
    await page.goto('/tools/damage-calc');
    await expect(page).toHaveURL(/damage-calc/);
  });

  test('/tools/replay-analyzer carga el analizador', async ({ page }) => {
    await page.goto('/tools/replay-analyzer');
    await expect(page).toHaveURL(/replay-analyzer/);
  });

  test('/typemaster carga el menú del juego', async ({ page }) => {
    await page.goto('/typemaster');
    await expect(page).toHaveURL(/typemaster/);
  });

  test('/guides lista las guías', async ({ page }) => {
    await page.goto('/guides');
    // Las 4 guías estáticas deben aparecer
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('/guides/counters-vs-kingambit carga la guía individual', async ({ page }) => {
    await page.goto('/guides/counters-vs-kingambit');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('/legal muestra la política de privacidad', async ({ page }) => {
    await page.goto('/legal');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('/support carga la página de donaciones', async ({ page }) => {
    await page.goto('/support');
    await expect(page).toHaveURL(/\/support/);
  });

  test('una ruta inexistente devuelve 404', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});
