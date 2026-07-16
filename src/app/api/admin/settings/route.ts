import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, getAdminClient } from '../../../../utils/supabase/admin';
import { z } from 'zod';

const settingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(1000),
});

export async function GET() {
  try {
    await requireAdmin();
    const db = getAdminClient();
    const { data, error } = await db.from('site_settings').select('*').order('key');
    if (error) throw error;
    // Convert to a key→value map for convenience
    const settings = Object.fromEntries(data.map((r: any) => [r.key, r.value]));
    return NextResponse.json({ settings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    // Accept object of {key: value} pairs
    const entries = Object.entries(body as Record<string, string>);
    if (entries.length === 0) return NextResponse.json({ error: 'No settings provided' }, { status: 400 });

    for (const [key, value] of entries) {
      const parsed = settingSchema.safeParse({ key, value });
      if (!parsed.success) return NextResponse.json({ error: `Invalid setting: ${key}` }, { status: 400 });
    }

    const db = getAdminClient();
    const upserts = entries.map(([key, value]) => ({ key, value }));
    const { error } = await db.from('site_settings').upsert(upserts, { onConflict: 'key' });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 500 });
  }
}
