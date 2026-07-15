import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { checkRateLimit, SUPPORT_RATE_LIMIT } from '../../../lib/rateLimit';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  return createClient(url, key);
}

const ticketSchema = z.object({
  user_name: z.string().min(2).max(80).regex(/^[a-zA-Z\s'-]+$/),
  user_email: z.string().email(),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(2000),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
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
    console.error('Support ticket submission error:', e.message);
    return NextResponse.json({ error: 'Failed to submit ticket' }, { status: 500 });
  }
}
