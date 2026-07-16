import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminClient } from '../../../../utils/supabase/admin';

export async function POST(req: Request) {
  try {
    // Guard: fail immediately if webhook secret is not configured
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Compute expected HMAC
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest();

    // Timing-safe comparison to prevent timing attacks
    const receivedSig = Buffer.from(signature, 'hex');
    const isValid =
      expectedSig.length === receivedSig.length &&
      crypto.timingSafeEqual(expectedSig, receivedSig);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      if (!payment?.order_id || !payment?.id) {
        return NextResponse.json({ error: 'Malformed payload' }, { status: 400 });
      }

      const supabaseAdmin = getAdminClient();
      const { error } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          razorpay_payment_id: payment.id,
          fulfillment_status: 'Confirmed',
        })
        .eq('razorpay_order_id', payment.order_id);

      if (error) {
        console.error('Supabase webhook update error:', error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      return NextResponse.json({ status: 'ok' });
    }

    if (event.event === 'payment.failed') {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        const supabaseAdmin = getAdminClient();
        await supabaseAdmin
          .from('orders')
          .update({ payment_status: 'failed' })
          .eq('razorpay_order_id', payment.order_id);
      }
      return NextResponse.json({ status: 'ok' });
    }

    return NextResponse.json({ status: 'ignored' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
