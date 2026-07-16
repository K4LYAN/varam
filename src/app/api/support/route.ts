import { NextResponse, type NextRequest } from 'next/server';
import { getAdminClient } from '../../../utils/supabase/admin';
import { z } from 'zod';
import { checkRateLimit, SUPPORT_RATE_LIMIT } from '../../../lib/rateLimit';

const ticketSchema = z.object({
  user_name: z.string().min(2).max(80).regex(/^[a-zA-Z\s'-]+$/),
  user_email: z.string().email(),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(2000),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  user_id: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const { allowed, resetInMs } = checkRateLimit(`support:${ip}`, SUPPORT_RATE_LIMIT);
    if (!allowed) {
      return NextResponse.json(
        { error: `Too many requests. Try again in ${Math.ceil(resetInMs / 60000)} minutes.` },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(resetInMs / 1000)) } }
      );
    }

    const body = await req.json();
    const parsed = ticketSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const db = getAdminClient();
    const { error } = await db.from('support_tickets').insert({
      ...parsed.data,
      status: 'open',
    });
    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e: any) {
    console.warn('Support ticket submission error:', e.message);
    const isSchemaError = e.message?.includes('relation') || e.message?.includes('schema cache') || e.message?.includes('table');
    const userMsg = isSchemaError 
      ? 'Database Support Ticket table is not initialized. Please run 001_admin_schema.sql in your Supabase SQL editor.' 
      : 'Failed to submit ticket. Please try again.';
    return NextResponse.json({ error: userMsg }, { status: 500 });
  }
}
