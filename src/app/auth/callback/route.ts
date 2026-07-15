import { createClient } from '../../../utils/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

/** Whitelist of safe internal redirect targets */
const SAFE_REDIRECT_PATHS = new Set([
  '/profile', '/checkout', '/cart', '/shop', '/order-success', '/'
]);

function isSafeRedirect(path: string): boolean {
  // Must be a relative path (no protocol), in the whitelist
  return path.startsWith('/') && !path.startsWith('//') && SAFE_REDIRECT_PATHS.has(path);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/profile';

  // Validate the redirect target
  const redirectPath = isSafeRedirect(next) ? next : '/profile';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
