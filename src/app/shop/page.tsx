"use client";

import { Plus, Filter, Search } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { PRODUCTS } from '../../data/products';
import { useAppContext } from '../../context/AppContext';

const CATEGORIES = ['All', 'Everyday Cooking', 'Heritage Collection', 'Versatile Essential', 'Robust Flavor', 'Wellness & Care', 'Premium Beauty'];

export default function Shop() {
  const { addToCart } = useAppContext();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = PRODUCTS.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#faf7f2] pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c9a84c] mb-3">Premium Selection</div>
          <h1 className="font-[Cormorant_Garamond] text-5xl md:text-6xl text-[#1c1c1c]">Our Collection</h1>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a84c]" />
            <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          </div>
          <p className="text-[#5a5a5a] mt-5 max-w-lg mx-auto">100% pure, wood-pressed oils for cooking, health, and wellness — extracted using traditional methods.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8a8a]" />
            <input
              type="text"
              placeholder="Search oils..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e0d8cc] text-sm text-[#1c1c1c] placeholder-[#aaa] focus:outline-none focus:border-[#2d5016] focus:ring-2 focus:ring-[#2d5016]/8 transition-all"
            />
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 text-[10px] font-bold tracking-wider uppercase border transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-[#2d5016] text-white border-[#2d5016]'
                    : 'bg-white text-[#5a5a5a] border-[#e0d8cc] hover:border-[#2d5016] hover:text-[#2d5016]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[#8a8a8a]">
            <p className="font-[Cormorant_Garamond] text-2xl mb-2">No products found</p>
            <p className="text-sm">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((product, idx) => (
              <div
                key={product.id}
                className="product-card group bg-white border border-[#ede0cc] overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative h-72 overflow-hidden bg-[#faf7f2]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-107 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Volume badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-[9px] font-bold tracking-widest uppercase text-[#1c1c1c] border border-[#e0d8cc]">
                    {product.volume}
                  </div>
                </div>

                {/* Info */}
                <div className="p-7 flex flex-col flex-grow">
                  <div className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#c9a84c] mb-2">{product.category}</div>
                  <h3 className="font-[Cormorant_Garamond] text-xl text-[#1c1c1c] mb-3 group-hover:text-[#2d5016] transition-colors leading-snug">{product.name}</h3>

                  {/* Benefits */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {product.benefits.map((b, i) => (
                      <span key={i} className="text-[9px] px-2.5 py-1 bg-[#faf7f2] text-[#5a5a5a] border border-[#ede0cc] tracking-wide">
                        {b}
                      </span>
                    ))}
                  </div>

                  <p className="text-[#8a8a8a] text-sm leading-relaxed flex-grow line-clamp-3">{product.description}</p>

                  <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#f0ead8]">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-[#8a8a8a] mb-0.5">Price</div>
                      <div className="font-[Cormorant_Garamond] text-2xl text-[#1c1c1c]">₹{product.price}</div>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="btn-primary py-2.5 px-5 text-[10px] flex items-center gap-1.5"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
