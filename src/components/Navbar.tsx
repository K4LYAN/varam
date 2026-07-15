"use client";

import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Menu, X, Leaf, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '../context/AppContext';

export const Navbar = () => {
  const { user, getCartCount } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Collection' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-[0_2px_40px_rgba(0,0,0,0.08)] py-2'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center">

            {/* Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${
                  scrolled ? 'bg-[#2d5016]' : 'bg-[#2d5016]/90'
                } group-hover:scale-110`}
              >
                <Leaf className="h-4 w-4 text-[#f5e9c0]" strokeWidth={2} />
              </div>
              <div>
                <div className="font-[Cormorant_Garamond] text-xl font-bold tracking-[0.22em] text-[#1c1c1c] leading-none">
                  VARAM
                </div>
                <div className="text-[9px] font-semibold tracking-[0.3em] text-[#2d5016] uppercase mt-0.5">
                  Pure · Organic
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`relative text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors duration-200
                    after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:h-px after:transition-all after:duration-300
                    ${isActive(href)
                      ? 'text-[#2d5016] after:w-full after:bg-[#c9a84c]'
                      : 'text-[#5a5a5a] hover:text-[#2d5016] after:w-0 after:bg-[#c9a84c] hover:after:w-full'
                    }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-5">
              <Link
                href={user ? '/profile' : '/login'}
                className="flex items-center gap-2 text-[#5a5a5a] hover:text-[#2d5016] transition-colors group"
              >
                <User className="h-[18px] w-[18px]" strokeWidth={1.8} />
                <span className="text-[11px] font-semibold tracking-wider uppercase">
                  {user ? 'Account' : 'Sign In'}
                </span>
              </Link>

              <div className="h-5 w-px bg-[#e0d8cc]" />

              <Link href="/cart" className="relative flex items-center gap-2 text-[#5a5a5a] hover:text-[#2d5016] transition-colors">
                <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={1.8} />
                <span className="text-[11px] font-semibold tracking-wider uppercase">Cart</span>
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2.5 w-5 h-5 flex items-center justify-center text-[9px] font-bold text-white bg-[#c9a84c] rounded-full">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile */}
            <div className="md:hidden flex items-center gap-4">
              <Link href="/cart" className="relative text-[#1c1c1c]">
                <ShoppingCart className="h-6 w-6" strokeWidth={1.8} />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[8px] font-bold text-white bg-[#c9a84c] rounded-full">
                    {getCartCount()}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[#1c1c1c] focus:outline-none p-1"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen
                  ? <X className="h-6 w-6" strokeWidth={1.8} />
                  : <Menu className="h-6 w-6" strokeWidth={1.8} />
                }
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-72 bg-white shadow-2xl animate-slideDown flex flex-col pt-24 px-8 pb-10">
            <div className="flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`font-[Cormorant_Garamond] text-2xl py-3 border-b border-[#f0ead8] transition-colors ${
                    isActive(href) ? 'text-[#2d5016]' : 'text-[#1c1c1c] hover:text-[#2d5016]'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <Link
                href={user ? '/profile' : '/login'}
                className="font-[Cormorant_Garamond] text-2xl py-3 border-b border-[#f0ead8] text-[#1c1c1c] hover:text-[#2d5016] transition-colors"
              >
                {user ? 'My Account' : 'Sign In'}
              </Link>
            </div>
            <div className="mt-auto">
              <div className="text-[10px] tracking-[0.25em] uppercase text-[#c9a84c] font-semibold">Pure · Organic · Authentic</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
