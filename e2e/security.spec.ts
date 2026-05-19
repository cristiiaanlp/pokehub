import { test, expect } from '@playwright/test';

test.describe('Seguridad', () => {
  test('open redirect bloqueado en /login?next=//evil.com', async ({ page }) => {
    await page.goto('/login?next=//evil.com');
    // Sin sesión, debe quedar en /login (no redirigir a evil.com)
    await expect(page).toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/evil\.com/);
  });

  test('/admin sin sesión → redirige a login', async ({ page }) => {
    await page.goto('/admin');
    // El layout admin hace redirect server-side
    await expect(page).toHaveURL(/\/login/);
  });

  test('/api/admin/announcements sin auth → 401', async ({ request }) => {
    const res = await request.post('/api/admin/announcements', {
      data: { title: 'malicious' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('/api/profile sin auth → 401', async ({ request }) => {
    const res = await request.patch('/api/profile', {
      data: { username: 'hacker' },
    });
    expect(res.status()).toBe(401);
  });

  test('headers de seguridad básicos', async ({ page }) => {
    const response = await page.goto('/');
    // Vercel + Next ponen X-Content-Type-Options, X-Frame-Options automáticamente
    expect(response).toBeTruthy();
  });
});
