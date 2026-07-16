import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, getAdminClient } from '../../../../utils/supabase/admin';
import { z } from 'zod';

const replySchema = z.object({
  id: z.number().int().positive(),
  admin_reply: z.string().max(2000).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const db = getAdminClient();
    let query = db.from('support_tickets').select('*').order('created_at', { ascending: false });
    if (status && ['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      query = query.eq('status', status);
    }
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ tickets: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = replySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const { id, ...updates } = parsed.data;
    const db = getAdminClient();
    const { data, error } = await db.from('support_tickets').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ ticket: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const db = getAdminClient();
    const { error } = await db.from('support_tickets').delete().eq('id', parseInt(id));
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 500 });
  }
}
