'use server';

import { createClient } from '../../utils/supabase/server';
import { getAdminClient } from '../../utils/supabase/admin';
import { z } from 'zod';
import Razorpay from 'razorpay';

// ─── Shipping input schema ───────────────────────────────────
const shippingSchema = z.object({
  fullName: z.string().min(2).max(80),
  address: z.string().min(5).max(300),
  city: z.string().min(2).max(80),
  pincode: z.string().regex(/^\d{6}$/, 'PIN code must be exactly 6 digits'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email(),
});

const cartItemSchema = z.array(
  z.object({ id: z.number().int().positive(), quantity: z.number().int().positive().max(99) })
);

// Helper function to validate and prepare order details
async function prepareOrderDetails(cartItems: any[], shippingDetails: Record<string, string>) {
  // 1. Verify the authenticated session server-side
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  // 2. Validate cart items
  const parsedCart = cartItemSchema.safeParse(cartItems);
  if (!parsedCart.success) throw new Error('Invalid cart data');

  // 3. Validate shipping details server-side
  const parsedShipping = shippingSchema.safeParse(shippingDetails);
  if (!parsedShipping.success) {
    const firstError = parsedShipping.error.errors[0]?.message ?? 'Invalid shipping details';
    throw new Error(firstError);
  }

  // 4. Fetch current product prices and details from Supabase
  const supabaseAdmin = getAdminClient();
  const productIds = parsedCart.data.map(i => i.id);
  const { data: products, error: productError } = await supabaseAdmin
    .from('products')
    .select('id, price, in_stock, name, image')
    .in('id', productIds);

  if (productError || !products?.length) throw new Error('Could not fetch product details');

  let subtotal = 0;
  const orderItems: any[] = [];

  for (const item of parsedCart.data) {
    const product = products.find(p => p.id === item.id);
    if (!product) throw new Error(`Product ${item.id} not found`);
    if (!product.in_stock) throw new Error(`Product ${item.id} is out of stock`);
    
    subtotal += product.price * item.quantity;
    orderItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.image
    });
  }

  const shippingCost = subtotal >= 999 ? 0 : 50;
  const totalAmount = subtotal + shippingCost;

  return { user, shippingData: parsedShipping.data, orderItems, totalAmount, supabaseAdmin };
}

export async function createRazorpayOrder(
  cartItems: { id: number; quantity: number }[],
  _ignoredUserId: string,
  shippingDetails: Record<string, string>
) {
  try {
    const { user, shippingData, orderItems, totalAmount, supabaseAdmin } = await prepareOrderDetails(cartItems, shippingDetails);

    // Validate Razorpay credentials
    const rzpKeyId = process.env.RAZORPAY_KEY_ID;
    const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!rzpKeyId || !rzpKeySecret) throw new Error('Payment gateway not configured');

    // Insert pending order
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        user_email: user.email,
        total_amount: totalAmount,
        payment_method: 'prepaid_razorpay',
        payment_status: 'pending',
        fulfillment_status: 'Processing',
        shipping_address: shippingData,
        items: orderItems,
      })
      .select('id')
      .single();

    if (orderError) throw new Error(`Database error: ${orderError.message}`);

    // Create Razorpay order
    const instance = new Razorpay({ key_id: rzpKeyId, key_secret: rzpKeySecret });
    const razorpayOrder = await instance.orders.create({
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: orderData.id,
    });

    // Store Razorpay order ID
    await supabaseAdmin
      .from('orders')
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq('id', orderData.id);

    return { success: true, order: razorpayOrder, databaseOrderId: orderData.id };
  } catch (error: any) {
    console.error('createRazorpayOrder error:', error?.message);
    return { success: false, error: error?.message ?? 'Failed to create order' };
  }
}

export async function createCODOrder(
  cartItems: { id: number; quantity: number }[],
  _ignoredUserId: string,
  shippingDetails: Record<string, string>
) {
  try {
    const { user, shippingData, orderItems, totalAmount, supabaseAdmin } = await prepareOrderDetails(cartItems, shippingDetails);

    // Insert pending COD order
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        user_email: user.email,
        total_amount: totalAmount,
        payment_method: 'cod',
        payment_status: 'pending', // Will be marked paid upon delivery
        fulfillment_status: 'Processing',
        shipping_address: shippingData,
        items: orderItems,
      })
      .select('id')
      .single();

    if (orderError) throw new Error(`Database error: ${orderError.message}`);

    return { success: true, databaseOrderId: orderData.id };
  } catch (error: any) {
    console.error('createCODOrder error:', error?.message);
    return { success: false, error: error?.message ?? 'Failed to create COD order' };
  }
}
