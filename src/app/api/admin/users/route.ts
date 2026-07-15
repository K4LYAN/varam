import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '../../../../utils/supabase/server';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  return createClient(url, key);
}

async function requireAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.is_admin !== true) throw new Error('Unauthorized');
  return user;
}

export async function GET() {
  try {
    await requireAdmin();
    const db = getAdminClient();
    const { data: { users }, error } = await db.auth.admin.listUsers({ perPage: 200 });
    if (error) throw error;
    // Sanitize: never expose hashed passwords or sensitive tokens
    const sanitized = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.name ?? '',
      is_admin: u.user_metadata?.is_admin === true,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      email_confirmed_at: u.email_confirmed_at,
      banned: u.banned_until ? new Date(u.banned_until) > new Date() : false,
    }));
    return NextResponse.json({ users: sanitized });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    const { id, is_admin, ban } = await req.json();
    if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    // Prevent admin from removing their own admin role
    if (id === adminUser.id && is_admin === false) {
      return NextResponse.json({ error: 'Cannot remove your own admin role' }, { status: 400 });
    }

    const db = getAdminClient();
    const updates: any = {};
    if (typeof is_admin === 'boolean') {
      updates.user_metadata = { is_admin };
    }
    if (typeof ban === 'boolean') {
      updates.ban_duration = ban ? '876600h' : 'none'; // ~100 years or unban
    }
    const { data, error } = await db.auth.admin.updateUserById(id, updates);
    if (error) throw error;
    return NextResponse.json({ success: true, user: data.user });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    if (id === adminUser.id) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    const db = getAdminClient();
    const { error } = await db.auth.admin.deleteUser(id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 500 });
  }
}
