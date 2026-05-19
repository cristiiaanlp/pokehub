import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

// Only allow same-origin paths to prevent open redirects.
function sanitizeNext(raw: string | null): string {
  if (!raw) return '/';
  if (!raw.startsWith('/')) return '/';
  if (raw.startsWith('//')) return '/';
  if (/^\/+\w+:/.test(raw)) return '/';
  return raw;
}

/**
 * OAuth + email confirmation callback. Supabase redirects here after the user
 * clicks the confirmation link in their email (or after social login). We
 * exchange the `code` for a session and redirect them to wherever they came
 * from (or home).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = sanitizeNext(searchParams.get('next'));
  const errorDescription = searchParams.get('error_description');

  if (errorDescription) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription)}`
    );
  }

  if (code) {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(
          'Supabase no está configurado en el servidor.'
        )}`
      );
    }
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${origin}/login`);
}
