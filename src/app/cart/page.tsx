import CartClient from './CartClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Shopping Cart | Varam Organics',
  description: 'View the organic wood pressed oils in your cart and complete your order.',
};

export default function CartPage() {
  return <CartClient />;
}
