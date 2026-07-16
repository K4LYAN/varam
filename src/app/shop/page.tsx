import ShopClient from './ShopClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Organic Oils | Varam Organics',
  description: 'Explore our collection of cold pressed & wood pressed sesame, groundnut, and coconut oils. 100% pure, natural, and chemical-free.',
  keywords: 'organic sesame oil, cold pressed groundnut oil, wood pressed coconut oil, Mara Chekku oil',
};

export default function ShopPage() {
  return <ShopClient />;
}
