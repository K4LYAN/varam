"use client";

import { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Leaf, Award, Heart, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PRODUCTS } from '../data/products';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../utils/supabase/client';

const TESTIMONIALS = [
  { name: 'Priya S.', location: 'Chennai', text: 'The sesame oil transformed my cooking. I can taste the difference immediately — rich, nutty, and absolutely pure.', rating: 5 },
  { name: 'Arjun M.', location: 'Bangalore', text: 'Finally an oil brand I can trust. The wood-press method is visible in the aroma and quality of every bottle.', rating: 5 },
  { name: 'Kavitha R.', location: 'Hyderabad', text: 'I use the castor oil for hair growth and it has been a game-changer. Pure, thick, and incredibly effective.', rating: 5 },
];

export default function Home() {
  const { addToCart } = useAppContext();
  const [productsList, setProductsList] = useState<any[]>(PRODUCTS);

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          const mapped = data.map(p => ({
            id: Number(p.id),
            name: p.name,
            price: p.price,
            volume: p.volume,
            category: p.category,
            description: p.description,
            image: p.image,
            imageColor: p.image_color || 'bg-[#FAF8F5]',
            accentColor: p.accent_color || 'text-[#8B5A2B]',
            benefits: p.benefits || [],
          }));
          setProductsList(mapped);
        }
      } catch (err: any) {
        console.warn('Could not load products from database, using static fallback:', err.message);
      }
    }
    loadProducts();
  }, []);

  const featuredProducts = productsList.slice(0, 3);

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen hero-gradient flex items-center pt-24 overflow-hidden">
        {/* Orb decorations */}
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full bg-[#c9a84c]/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-[#2d5016]/15 blur-[80px] pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-64 h-64 rounded-full bg-[#ede0cc]/60 blur-[60px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Copy */}
            <div className="text-center lg:text-left opacity-0 animate-fadeInUp" style={{ animationFillMode: 'forwards' }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2d5016]/8 border border-[#2d5016]/15 mb-8">
                <Leaf className="h-3 w-3 text-[#2d5016]" />
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#2d5016]">The Heritage of Health</span>
              </div>

              <h1 className="font-[Cormorant_Garamond] text-5xl sm:text-6xl md:text-7xl lg:text-[80px] leading-[1.05] text-[#1c1c1c] mb-6">
                Pure, Unrefined
                <br />
                <em className="text-[#2d5016] not-italic">Wood Pressed</em>
                <br />
                <span className="text-[#c9a84c]">Oils.</span>
              </h1>

              <p className="text-[#5a5a5a] text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-10">
                Experience the authentic taste and unmatched health benefits of traditional <strong className="text-[#1c1c1c] font-medium">Mara Chekku</strong> extraction. No heat, no chemicals — just nature, untouched.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/shop" className="btn-primary">
                  Explore Collection
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/shop" className="btn-outline">
                  Our Process
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 mt-12 justify-center lg:justify-start">
                {[
                  { label: '100% Organic', sub: 'Certified' },
                  { label: '6 Premium', sub: 'Variants' },
                  { label: 'Direct from', sub: 'Farm' },
                ].map(({ label, sub }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-1 h-8 bg-[#c9a84c] rounded-full" />
                    <div>
                      <div className="text-[11px] font-bold tracking-wider text-[#1c1c1c] uppercase">{label}</div>
                      <div className="text-[10px] text-[#8a8a8a] tracking-wider">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="relative flex justify-center lg:justify-end opacity-0 animate-fadeInUp delay-300" style={{ animationFillMode: 'forwards' }}>
              <div className="relative w-[340px] h-[420px] sm:w-[400px] sm:h-[500px]">
                {/* Main image container */}
                <div className="absolute inset-0 rounded-[40px] overflow-hidden shadow-[0_40px_120px_rgba(45,80,22,0.25)]">
                  <Image
                    src="/images/sesame_oil.png"
                    alt="Premium Sesame Oil"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 640px) 340px, 400px"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e1f]/60 via-transparent to-transparent" />
                  {/* Badge inside */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="glass rounded-2xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#c9a84c] flex items-center justify-center shrink-0">
                        <Leaf className="h-5 w-5 text-white" strokeWidth={2} />
                      </div>
                      <div>
                        <div className="font-[Cormorant_Garamond] text-base font-semibold text-[#1c1c1c]">100% Organic</div>
                        <div className="text-[10px] tracking-widest uppercase text-[#5a5a5a]">Cold Pressed</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating card — top right */}
                <div className="absolute -top-5 -right-5 sm:-right-10 glass rounded-2xl p-4 shadow-xl animate-float">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#2d5016]" strokeWidth={1.8} />
                    <div>
                      <div className="text-[10px] font-bold tracking-wider uppercase text-[#1c1c1c]">Certified Pure</div>
                      <div className="text-[9px] text-[#8a8a8a]">FSSAI Approved</div>
                    </div>
                  </div>
                </div>

                {/* Floating card — bottom left */}
                <div className="absolute -bottom-5 -left-5 sm:-left-10 glass rounded-2xl p-4 shadow-xl animate-float" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className="h-3 w-3 text-[#c9a84c] fill-[#c9a84c]" />
                      ))}
                    </div>
                    <div className="text-[10px] font-bold text-[#1c1c1c]">4.9/5 Rated</div>
                  </div>
                  <div className="text-[9px] text-[#8a8a8a] mt-1">From 2,400+ reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROMISE STRIP ─────────────────────────────────── */}
      <section className="bg-[#2d5016] py-5">
        <div className="max-w-6xl mx-auto px-5 flex flex-wrap justify-center gap-x-12 gap-y-3">
          {[
            'Free shipping above ₹999',
            '100% natural ingredients',
            'Straight from farm to bottle',
            '7-day return guarantee',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-white/90 text-[11px] font-medium tracking-wider uppercase">
              <span className="w-1 h-1 rounded-full bg-[#c9a84c] inline-block" />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center mb-16">
            <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c9a84c] mb-3">Bestsellers</div>
            <h2 className="font-[Cormorant_Garamond] text-4xl md:text-5xl text-[#1c1c1c]">Our Finest Oils</h2>
            <div className="ornament mt-4">
              <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, idx) => (
              <div
                key={product.id}
                className="product-card group bg-[#faf7f2] border border-[#ede0cc] overflow-hidden opacity-0 animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.12}s`, animationFillMode: 'forwards' }}
              >
                <div className="relative h-64 overflow-hidden bg-white">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-[9px] font-bold tracking-widest uppercase text-[#1c1c1c] border border-[#e0d8cc]">
                    {product.volume}
                  </div>
                </div>
                <div className="p-7">
                  <div className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#c9a84c] mb-2">{product.category}</div>
                  <h3 className="font-[Cormorant_Garamond] text-xl text-[#1c1c1c] mb-4 group-hover:text-[#2d5016] transition-colors">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-[Cormorant_Garamond] text-2xl text-[#2d5016]">₹{product.price}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="btn-primary py-2.5 px-5 text-[10px]"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/shop" className="btn-outline inline-flex items-center gap-2">
              View All Oils <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── STORY SECTION ─────────────────────────────────── */}
      <section className="py-28 section-gradient">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left — Visual */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/groundnut_oil.png"
                  alt="Traditional Wood Press Process"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Decorative box */}
              <div className="absolute -bottom-8 -right-8 bg-[#2d5016] text-white p-8 rounded-2xl w-44 shadow-xl">
                <div className="font-[Cormorant_Garamond] text-5xl font-bold text-[#c9a84c]">50+</div>
                <div className="text-[10px] tracking-widest uppercase text-white/70 mt-1">Years of Traditional Craft</div>
              </div>
            </div>

            {/* Right — Copy */}
            <div>
              <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c9a84c] mb-4">Our Story</div>
              <h2 className="font-[Cormorant_Garamond] text-4xl md:text-5xl text-[#1c1c1c] mb-6 leading-tight">
                Ancient Wisdom.<br />Modern Purity.
              </h2>
              <p className="text-[#5a5a5a] leading-relaxed mb-6">
                For generations, our farmers have practiced the sacred art of wood-pressed oil extraction — a method that runs the oil seeds through a slowly rotating wooden ghani, generating no heat that would destroy nutrients.
              </p>
              <p className="text-[#5a5a5a] leading-relaxed mb-10">
                The result is an oil that retains 100% of its natural vitamins, minerals, and flavor — a living food in its truest form, exactly as nature intended.
              </p>

              <div className="grid grid-cols-3 gap-6 mb-10">
                {[
                  { icon: Award, label: 'Traditional Process' },
                  { icon: Heart, label: 'Zero Chemicals' },
                  { icon: Leaf, label: 'Organic Farms' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[#2d5016]/8 border border-[#2d5016]/15 flex items-center justify-center mx-auto mb-3">
                      <Icon className="h-5 w-5 text-[#2d5016]" strokeWidth={1.5} />
                    </div>
                    <div className="text-[10px] font-bold tracking-wider uppercase text-[#5a5a5a]">{label}</div>
                  </div>
                ))}
              </div>

              <Link href="/shop" className="btn-primary inline-flex">
                Shop Our Oils <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center mb-16">
            <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c9a84c] mb-3">Real Customers</div>
            <h2 className="font-[Cormorant_Garamond] text-4xl md:text-5xl text-[#1c1c1c]">What People Say</h2>
            <div className="ornament mt-4">
              <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ name, location, text, rating }, idx) => (
              <div key={idx} className="bg-[#faf7f2] border border-[#ede0cc] p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-[#c9a84c] fill-[#c9a84c]" />
                  ))}
                </div>
                <p className="text-[#5a5a5a] text-sm leading-relaxed italic mb-6">"{text}"</p>
                <div>
                  <div className="font-semibold text-[#1c1c1c] text-sm">{name}</div>
                  <div className="text-[11px] text-[#c9a84c] tracking-wider">{location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section className="relative bg-[#1a2e1f] py-24 overflow-hidden text-center px-5">
        <div className="absolute inset-0 bg-[url('/images/sesame_oil.png')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a2e1f] via-[#1a2e1f]/80 to-[#1a2e1f]" />
        <div className="relative z-10">
          <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c9a84c] mb-5">Make the Switch</div>
          <h2 className="font-[Cormorant_Garamond] text-4xl md:text-6xl text-white mb-6 max-w-3xl mx-auto leading-tight">
            Taste the Difference of True Cold-Pressed.
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-10 leading-relaxed">
            Switch to healthier cooking oils today and feel the impact on your family's well-being. Your first step to a purer life starts here.
          </p>
          <Link href="/shop" className="btn-primary bg-[#c9a84c] hover:bg-[#a8872a] text-[#1a2e1f] inline-flex items-center gap-2">
            Shop the Collection <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
