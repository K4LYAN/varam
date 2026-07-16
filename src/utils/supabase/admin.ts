import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from './server';
import { createMockClient } from './mock';

const isConfigured = 
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' && process.env.NEXT_PUBLIC_SUPABASE_URL.trim() !== '' &&
  typeof process.env.SUPABASE_SERVICE_ROLE_KEY === 'string' && process.env.SUPABASE_SERVICE_ROLE_KEY.trim() !== '';

/**
 * Creates a Supabase client authenticated with the service_role key.
 * This bypasses RLS and should only be used in secure server-side environments.
 */
export function getAdminClient() {
  if (!isConfigured) {
    return createMockClient();
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Asserts that the current request is authenticated and authorized as an admin.
 * Verifies both the auth user session and checks the database profiles table.
 * Throws an Error if unauthorized.
 */
export async function requireAdmin() {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  // 1. In mock mode, we fallback to user metadata check
  if (!isConfigured) {
    if (user.user_metadata?.is_admin !== true) {
      throw new Error('Unauthorized');
    }
    return user;
  }

  // 2. Query the profiles table to prevent metadata spoofing/privilege escalation
  const { data: profile, error: dbError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (dbError || !profile || profile.is_admin !== true) {
    throw new Error('Unauthorized');
  }

  return user;
}
