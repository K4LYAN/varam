"use client";

import { useState, useEffect } from 'react';
import { Package, CreditCard, ShieldCheck, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../context/AppContext';
import { createRazorpayOrder } from '../actions/payment';

declare global {
  interface Window { Razorpay: any; }
}

const inputCls = "input-premium";
const labelCls = "block text-[10px] font-bold tracking-[0.2em] uppercase text-[#5a5a5a] mb-2";

export default function Checkout() {
  const { cart, getCartTotal, user, showToast } = useAppContext();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const subtotal = getCartTotal();
  const shipping = subtotal >= 999 ? 0 : 50;
  const total = subtotal + shipping;

  if (mounted && cart.length === 0) {
    router.push('/cart');
    return null;
  }

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to place an order.');
      router.push('/login?redirect=checkout');
      return;
    }

    setIsProcessing(true);
    const formData = new FormData(e.currentTarget);
    const shippingDetails = Object.fromEntries(
      Array.from(formData.entries()).map(([k, v]) => [k, v.toString()])
    ) as Record<string, string>;
    const paymentMethod = formData.get('payment') as string;
    const cartItemsInput = cart.map(item => ({ id: item.id, quantity: item.quantity }));

    if (paymentMethod === 'online') {
      try {
        const { success, order, error } = await createRazorpayOrder(cartItemsInput, user.id, shippingDetails);
        if (!success || !order) {
          showToast(`Failed to initiate payment: ${error}`);
          setIsProcessing(false);
          return;
        }
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
          amount: order.amount,
          currency: order.currency,
          name: 'Varam Organics',
          description: 'Premium Cold-Pressed Oils',
          order_id: order.id,
          handler: () => { showToast('Payment successful!'); router.push('/order-success'); },
          prefill: { name: user.name, email: user.email, contact: shippingDetails.phone as string },
          theme: { color: '#2d5016' },
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (r: any) => showToast(`Payment Failed: ${r.error.description}`));
        rzp.open();
      } catch {
        showToast('Error initializing payment gateway.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      showToast('COD order placed successfully!');
      router.push('/order-success');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Breadcrumb */}
        <Link href="/cart" className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-[#8a8a8a] hover:text-[#2d5016] transition-colors mb-8">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Cart
        </Link>

        <h1 className="font-[Cormorant_Garamond] text-4xl text-[#1c1c1c] mb-10 pb-6 border-b border-[#ede0cc]">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left — Forms */}
          <div className="flex-grow space-y-6">
            <form id="checkout-form" onSubmit={handleCheckout}>

              {/* Shipping */}
              <div className="bg-white border border-[#ede0cc] p-8 mb-6">
                <h2 className="font-[Cormorant_Garamond] text-2xl text-[#1c1c1c] mb-7 flex items-center gap-3">
                  <Package className="h-5 w-5 text-[#c9a84c]" strokeWidth={1.8} />
                  Shipping Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Full Name</label>
                    <input type="text" name="fullName" required defaultValue={user?.name || ''} className={inputCls} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Street Address</label>
                    <input type="text" name="address" required placeholder="House/Flat number and street name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>City</label>
                    <input type="text" name="city" required className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>PIN Code</label>
                    <input type="text" name="pincode" required pattern="[0-9]{6}" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number</label>
                    <input type="tel" name="phone" required defaultValue={user?.phone || ''} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Email Address</label>
                    <input type="email" name="email" required defaultValue={user?.email || ''} className={inputCls} />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white border border-[#ede0cc] p-8">
                <h2 className="font-[Cormorant_Garamond] text-2xl text-[#1c1c1c] mb-7 flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-[#c9a84c]" strokeWidth={1.8} />
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {/* Razorpay */}
                  <label className="flex items-center p-5 border-2 border-[#2d5016] bg-[#2d5016]/4 cursor-pointer group">
                    <input type="radio" name="payment" value="online" defaultChecked className="h-4 w-4 text-[#2d5016] accent-[#2d5016]" />
                    <div className="ml-4 flex items-center gap-2">
                      <span className="font-medium text-[#1c1c1c]">Pay Online (Razorpay)</span>
                      <ShieldCheck className="h-4 w-4 text-[#2d5016]" strokeWidth={1.8} />
                    </div>
                    <span className="ml-auto text-[10px] text-[#8a8a8a] tracking-wider">UPI / Cards / Netbanking</span>
                  </label>
                  {/* COD */}
                  <label className="flex items-center p-5 border border-[#ede0cc] hover:border-[#2d5016]/30 cursor-pointer transition-colors">
                    <input type="radio" name="payment" value="cod" className="h-4 w-4 text-[#2d5016] accent-[#2d5016]" />
                    <div className="ml-4">
                      <span className="font-medium text-[#1c1c1c]">Cash on Delivery</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Info className="h-3 w-3 text-[#8a8a8a]" />
                        <span className="text-[10px] text-[#8a8a8a]">OTP verification required at delivery</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Right — Order Summary */}
          <div className="lg:w-[380px] shrink-0">
            <div className="bg-white border border-[#ede0cc] p-8 sticky top-28">
              <h2 className="font-[Cormorant_Garamond] text-2xl text-[#1c1c1c] mb-6 pb-5 border-b border-[#f0ead8]">
                Your Order
              </h2>

              <div className="max-h-[35vh] overflow-y-auto space-y-4 mb-6 pr-1 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-[#5a5a5a] truncate max-w-[200px]">
                      <span className="font-bold text-[#c9a84c] mr-1.5">{item.quantity}×</span>
                      {item.name}
                    </span>
                    <span className="font-medium text-[#1c1c1c] shrink-0 ml-2">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm border-t border-[#f0ead8] pt-5 mb-5">
                <div className="flex justify-between text-[#5a5a5a]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#1c1c1c]">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-[#5a5a5a]">
                  <span>Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-[#2d5016]' : 'text-[#1c1c1c]'}`}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end pb-6 border-b border-[#f0ead8] mb-6">
                <span className="text-[11px] uppercase tracking-widest font-bold text-[#8a8a8a]">Total</span>
                <span className="font-[Cormorant_Garamond] text-3xl text-[#2d5016]">₹{total}</span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isProcessing}
                className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>Processing... <ShieldCheck className="h-4 w-4 animate-pulse" /></>
                ) : 'Place Order Securely'}
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-[#8a8a8a] text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
                <span>SSL Encrypted &amp; Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
