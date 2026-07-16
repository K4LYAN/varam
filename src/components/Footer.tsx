"use client";

import { Leaf, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Footer = () => {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#111a0f] text-white relative overflow-hidden">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent" />

      {/* Decorative circles */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#2d5016]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#c9a84c]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* Brand Column */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-[#2d5016] flex items-center justify-center">
                <Leaf className="h-4 w-4 text-[#f5e9c0]" strokeWidth={2} />
              </div>
              <div>
                <div className="font-[Cormorant_Garamond] text-xl font-bold tracking-[0.22em] text-white leading-none">VARAM</div>
                <div className="text-[9px] tracking-[0.3em] text-[#c9a84c] uppercase mt-0.5">Pure · Organic</div>
              </div>
            </div>
            <p className="text-[#8a8a8a] text-sm leading-relaxed max-w-xs">
              Dedicated to reviving the ancient art of wood-pressed oil extraction. Every bottle carries centuries of wisdom and the purest expression of nature.
            </p>
            <div className="flex items-center gap-3 mt-8">
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center text-[#8a8a8a] hover:text-[#c9a84c] hover:border-[#c9a84c] transition-all duration-300">
                <Instagram className="h-4 w-4" strokeWidth={1.8} />
              </a>
              <a href="mailto:support@organicvaram.com" aria-label="Email" className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center text-[#8a8a8a] hover:text-[#c9a84c] hover:border-[#c9a84c] transition-all duration-300">
                <Mail className="h-4 w-4" strokeWidth={1.8} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] font-bold tracking-[0.28em] uppercase text-[#c9a84c] mb-7">Explore</h4>
            <ul className="space-y-4">
              {[
                { href: '/', label: 'Home' },
                { href: '/shop', label: 'Our Collection' },
                { href: '/cart', label: 'Cart' },
                { href: '/login', label: 'Sign In' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[#8a8a8a] hover:text-white text-sm transition-colors duration-200 hover:tracking-wider">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="text-[10px] font-bold tracking-[0.28em] uppercase text-[#c9a84c] mb-7">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-[#c9a84c] mt-0.5 shrink-0" strokeWidth={1.8} />
                <span className="text-[#8a8a8a] text-sm">support@organicvaram.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[#c9a84c] shrink-0" strokeWidth={1.8} />
                <span className="text-[#8a8a8a] text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#c9a84c] mt-0.5 shrink-0" strokeWidth={1.8} />
                <span className="text-[#8a8a8a] text-sm leading-relaxed">123 Heritage Farm Road,<br/>Agriculture District, 500001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#1e2a1c] flex flex-col md:flex-row justify-between items-center gap-4 text-[#555] text-[11px] tracking-wider uppercase">
          <p>&copy; {new Date().getFullYear()} Organic Varam. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#c9a84c] cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-[#c9a84c] cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
