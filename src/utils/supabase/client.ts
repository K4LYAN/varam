import { createBrowserClient } from '@supabase/ssr'
import { createMockClient } from './mock'

const isConfigured = 
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' && process.env.NEXT_PUBLIC_SUPABASE_URL.trim() !== '' &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string' && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim() !== '';

export function createClient() {
  if (!isConfigured) {
    return createMockClient();
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Keep the old exported instance for backwards compatibility with existing code
export const supabase = createClient();
