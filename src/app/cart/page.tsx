"use client";

import { ShoppingCart, Plus, Minus, Trash2, ShieldCheck, ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../context/AppContext';

export default function Cart() {
  const { cart, getCartTotal, getCartCount, updateCartQuantity, removeFromCart } = useAppContext();
  const router = useRouter();

  const subtotal = getCartTotal();
  const shipping = subtotal >= 999 ? 0 : 50;
  const total = subtotal + shipping;
  const freeShippingRemaining = 999 - subtotal;

  return (
    <div className="min-h-screen bg-[#faf7f2] pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Header */}
        <div className="flex items-end justify-between mb-12 pb-6 border-b border-[#ede0cc]">
          <div>
            <h1 className="font-[Cormorant_Garamond] text-4xl text-[#1c1c1c]">Shopping Cart</h1>
            <p className="text-[#8a8a8a] text-sm mt-1">{getCartCount()} {getCartCount() === 1 ? 'item' : 'items'}</p>
          </div>
          <Link href="/shop" className="text-[11px] font-bold tracking-widest uppercase text-[#2d5016] hover:text-[#c9a84c] transition-colors flex items-center gap-1">
            Continue Shopping <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-24 bg-white border border-[#ede0cc]">
            <ShoppingCart className="h-16 w-16 mx-auto text-[#ddd] mb-6" strokeWidth={1} />
            <h2 className="font-[Cormorant_Garamond] text-3xl text-[#1c1c1c] mb-3">Your cart is empty</h2>
            <p className="text-[#8a8a8a] mb-8">Looks like you haven't added any premium oils yet.</p>
            <Link href="/shop" className="btn-primary inline-flex">
              Explore Collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Cart Items */}
            <div className="flex-grow space-y-4">
              {/* Free shipping bar */}
              {subtotal < 999 && (
                <div className="bg-[#2d5016]/6 border border-[#2d5016]/15 px-5 py-3.5 flex items-center gap-3">
                  <Tag className="h-4 w-4 text-[#2d5016] shrink-0" />
                  <p className="text-[#2d5016] text-sm">
                    Add <strong>₹{freeShippingRemaining}</strong> more for <strong>free shipping</strong>!
                  </p>
                  <div className="ml-auto w-24 h-1.5 bg-[#2d5016]/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2d5016] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (subtotal / 999) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-5 bg-white border border-[#ede0cc] p-5 group hover:border-[#2d5016]/30 transition-colors">
                  {/* Image */}
                  <div className="relative w-20 h-20 shrink-0 overflow-hidden bg-[#faf7f2]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-grow min-w-0">
                    <h3 className="font-[Cormorant_Garamond] text-lg text-[#1c1c1c] leading-tight">{item.name}</h3>
                    <p className="text-[#8a8a8a] text-xs mt-0.5">{item.volume}</p>
                    <p className="text-[#c9a84c] font-semibold text-sm mt-1">₹{item.price} each</p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center border border-[#ede0cc] shrink-0">
                    <button
                      onClick={() => updateCartQuantity(item.id, -1)}
                      className="w-9 h-9 flex items-center justify-center text-[#5a5a5a] hover:bg-[#faf7f2] hover:text-[#2d5016] transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-[#1c1c1c]">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, 1)}
                      className="w-9 h-9 flex items-center justify-center text-[#5a5a5a] hover:bg-[#faf7f2] hover:text-[#2d5016] transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Line total + remove */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="font-[Cormorant_Garamond] text-xl text-[#1c1c1c]">₹{item.price * item.quantity}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-[#aaa] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-[360px] shrink-0">
              <div className="bg-white border border-[#ede0cc] p-8 sticky top-28">
                <h2 className="font-[Cormorant_Garamond] text-2xl text-[#1c1c1c] mb-7 pb-5 border-b border-[#f0ead8]">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between text-[#5a5a5a]">
                    <span>Subtotal ({getCartCount()} items)</span>
                    <span className="font-medium text-[#1c1c1c]">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-[#5a5a5a]">
                    <span>Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-[#2d5016]' : 'text-[#1c1c1c]'}`}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end py-5 border-t border-b border-[#f0ead8] mb-7">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-[#8a8a8a]">Total</span>
                  <span className="font-[Cormorant_Garamond] text-3xl text-[#2d5016]">₹{total}</span>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  className="btn-primary w-full justify-center"
                >
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </button>

                <div className="mt-6 flex items-center justify-center gap-2 text-[#8a8a8a] text-[11px]">
                  <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
                  <span>Secure &amp; Encrypted Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
