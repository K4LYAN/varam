import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin, getAdminClient } from '../../../../utils/supabase/admin';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(2).max(200),
  price: z.number().int().positive(),
  volume: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(10),
  image: z.string().min(1),
  image_color: z.string().default('bg-[#F3E5AB]'),
  accent_color: z.string().default('text-[#8B5A2B]'),
  benefits: z.array(z.string()).default([]),
  in_stock: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    const db = getAdminClient();
    const { data, error } = await db.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ products: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const db = getAdminClient();
    const { data, error } = await db.from('products').insert(parsed.data).select().single();
    if (error) throw error;
    return NextResponse.json({ product: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const parsed = productSchema.partial().safeParse(rest);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const db = getAdminClient();
    const { data, error } = await db.from('products').update(parsed.data).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ product: data });
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
    const { error } = await db.from('products').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 500 });
  }
}
