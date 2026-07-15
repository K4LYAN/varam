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

const VALID_STATUSES = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);

    const db = getAdminClient();
    let query = db.from('orders').select('*').order('created_at', { ascending: false }).limit(limit);
    if (status && VALID_STATUSES.includes(status)) query = query.eq('fulfillment_status', status);
    if (search) query = query.or(`id.ilike.%${search}%,user_email.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ orders: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const { id, fulfillment_status, notes } = await req.json();
    if (!id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    if (fulfillment_status && !VALID_STATUSES.includes(fulfillment_status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const db = getAdminClient();
    const updates: Record<string, string> = {};
    if (fulfillment_status) updates.fulfillment_status = fulfillment_status;
    if (notes !== undefined) updates.notes = notes;
    const { data, error } = await db.from('orders').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ order: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 500 });
  }
}
