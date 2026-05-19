// Admin role helpers — used on both client and server.
// Source of truth: NEXT_PUBLIC_ADMIN_EMAILS env var, comma-separated list.
//
// IMPORTANT: this only controls UI visibility. Actual privileged operations
// MUST also verify on the server before touching the database (see API routes
// under /api/admin/*).

function parseEmails(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminEmails(): string[] {
  return parseEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = getAdminEmails();
  if (admins.length === 0) return false;
  return admins.includes(email.toLowerCase());
}
