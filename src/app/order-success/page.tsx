"use client";

import { CheckCircle, Package, ArrowRight, Leaf } from 'lucide-react';
import Link from 'next/link';
import { useAppContext } from '../../context/AppContext';

export default function OrderSuccess() {
  const { orders } = useAppContext();
  const lastOrder = orders[0];

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center pt-24 pb-20 px-4">
      <div className="max-w-lg w-full text-center">

        {/* Success icon */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="w-28 h-28 rounded-full bg-[#2d5016]/8 border-2 border-[#2d5016]/15 flex items-center justify-center">
            <CheckCircle className="h-14 w-14 text-[#2d5016]" strokeWidth={1.3} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#c9a84c] flex items-center justify-center">
            <Leaf className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
        </div>

        <h1 className="font-[Cormorant_Garamond] text-4xl md:text-5xl text-[#1c1c1c] mb-4">
          Order Confirmed!
        </h1>
        <p className="text-[#8a8a8a] leading-relaxed mb-8 max-w-sm mx-auto">
          Thank you for choosing Organic Varam. Your order has been placed and is being carefully prepared.
        </p>

        {/* Order details */}
        {lastOrder && (
          <div className="bg-white border border-[#ede0cc] p-7 mb-8 text-left">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#f0ead8]">
              <Package className="h-5 w-5 text-[#c9a84c]" strokeWidth={1.8} />
              <div>
                <div className="font-semibold text-[#1c1c1c] text-sm">{lastOrder.id}</div>
                <div className="text-[10px] tracking-wider uppercase text-[#8a8a8a]">{lastOrder.date}</div>
              </div>
              <div className="ml-auto">
                <span className="text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 bg-[#2d5016]/8 text-[#2d5016] border border-[#2d5016]/15">
                  {lastOrder.status}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {lastOrder.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#5a5a5a]">
                    <span className="font-semibold text-[#c9a84c] mr-1.5">{item.quantity}×</span>
                    {item.name}
                  </span>
                  <span className="font-medium text-[#1c1c1c]">₹{item.price * item.quantity}</span>
                </div>
              ))}
              {lastOrder.items.length > 3 && (
                <div className="text-xs text-[#8a8a8a]">+{lastOrder.items.length - 3} more items</div>
              )}
            </div>

            <div className="flex justify-between items-center mt-5 pt-4 border-t border-[#f0ead8]">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#8a8a8a]">Order Total</span>
              <span className="font-[Cormorant_Garamond] text-2xl text-[#2d5016]">₹{lastOrder.total}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/profile" className="btn-primary inline-flex justify-center">
            Track Order <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/shop" className="btn-outline inline-flex justify-center">
            Continue Shopping
          </Link>
        </div>

        <p className="text-[10px] tracking-wider uppercase text-[#8a8a8a] mt-10">
          You'll receive a confirmation email shortly
        </p>
      </div>
    </div>
  );
}
