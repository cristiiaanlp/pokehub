import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';

const ALLOWED_PATHS = [
  '/',
  '/pokedex',
  '/meta',
  '/meta/champions',
  '/meta/teams',
  '/community/teams',
  '/typemaster',
  '/typemaster/meta-daily',
];

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let body: { path?: string };
  try {
    body = (await req.json()) as { path?: string };
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const path = body.path;
  if (!path || !ALLOWED_PATHS.includes(path)) {
    return NextResponse.json(
      { error: 'invalid_path', allowed: ALLOWED_PATHS },
      { status: 400 }
    );
  }

  try {
    revalidatePath(path);
    return NextResponse.json({ ok: true, path, revalidatedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'unknown' },
      { status: 500 }
    );
  }
}
