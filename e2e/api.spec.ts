import { test, expect } from '@playwright/test';

test.describe('API endpoints (sin auth)', () => {
  test('GET /api/announcements responde array', async ({ request }) => {
    const res = await request.get('/api/announcements');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data.items)).toBe(true);
  });

  test('GET /api/notifications sin sesión → empty', async ({ request }) => {
    const res = await request.get('/api/notifications');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.unread).toBe(0);
    expect(Array.isArray(data.items)).toBe(true);
  });

  test('GET /api/profile/status sin sesión → no necesita onboarding', async ({ request }) => {
    const res = await request.get('/api/profile/status');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.needs_onboarding).toBe(false);
  });

  test('GET /api/replay sin url → 400', async ({ request }) => {
    const res = await request.get('/api/replay');
    expect(res.status()).toBe(400);
  });

  test('GET /api/replay con url no-Showdown → 400', async ({ request }) => {
    const res = await request.get('/api/replay?url=https://evil.com/log');
    expect(res.status()).toBe(400);
  });
});
