'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, Users, MessageSquare,
  Settings, LogOut, Leaf, ChevronLeft, ChevronRight, Shield,
  Menu, X
} from 'lucide-react';
import { createClient } from '../../../utils/supabase/client';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/support', label: 'Support', icon: MessageSquare },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({ adminName, adminEmail }: { adminName: string; adminEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <>
      {/* ── DESKTOP SIDEBAR ─────────────────────────────── */}
      <aside
        className="admin-sidebar-desktop"
        style={{
          width: collapsed ? 72 : 240,
          minHeight: '100vh',
          background: '#0B1A0E',
          borderRight: '1px solid rgba(201,168,76,0.15)',
          flexDirection: 'column',
          transition: 'width 0.25s cubic-bezier(.4,0,.2,1)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexShrink: 0,
          zIndex: 10,
          overflowY: 'auto',
        }}
      >
        {/* Logo + collapse toggle */}
        <div style={{
          padding: collapsed ? '20px 16px' : '24px 20px',
          borderBottom: '1px solid rgba(201,168,76,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(201,168,76,0.15)',
              border: '1.5px solid rgba(201,168,76,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Leaf size={16} color="#c9a84c" />
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', color: '#f5e9c0', fontSize: 16, fontWeight: 600, letterSpacing: '0.12em', lineHeight: 1 }}>
                  VARAM
                </div>
                <div style={{ color: 'rgba(201,168,76,0.7)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 3 }}>
                  Admin Console
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: '#8a8a7a', flexShrink: 0,
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Admin badge */}
        {!collapsed && (
          <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: 6, padding: '6px 10px',
            }}>
              <Shield size={12} color="#c9a84c" />
              <span style={{ color: '#c9a84c', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Admin Access
              </span>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: collapsed ? '11px 18px' : '11px 14px',
                  borderRadius: 8, marginBottom: 2, textDecoration: 'none',
                  background: active ? 'rgba(201,168,76,0.12)' : 'transparent',
                  borderLeft: active ? '2px solid #c9a84c' : '2px solid transparent',
                  color: active ? '#f5e9c0' : 'rgba(245,233,192,0.45)',
                  transition: 'all 0.15s ease',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(245,233,192,0.75)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(245,233,192,0.45)';
                  }
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, letterSpacing: '0.02em' }}>
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div style={{ borderTop: '1px solid rgba(201,168,76,0.12)', padding: '16px 8px' }}>
          {!collapsed && (
            <div style={{ padding: '8px 14px 12px', overflow: 'hidden' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: 'rgba(201,168,76,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#c9a84c', fontWeight: 700, fontSize: 13, marginBottom: 8,
              }}>
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div style={{ color: '#f5e9c0', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {adminName}
              </div>
              <div style={{ color: 'rgba(245,233,192,0.4)', fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                {adminEmail}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sign Out' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: collapsed ? '11px 18px' : '10px 14px', borderRadius: 8,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'rgba(239,68,68,0.7)', transition: 'all 0.15s ease',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
              (e.currentTarget as HTMLElement).style.color = '#ef4444';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'rgba(239,68,68,0.7)';
            }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: 13, fontWeight: 500 }}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ──────────────────────────────── */}
      <header
        className="admin-mobile-header"
        style={{
          background: '#0B1A0E',
          borderBottom: '1px solid rgba(201,168,76,0.15)',
          padding: '0 20px',
          height: 56,
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(201,168,76,0.15)',
            border: '1.5px solid rgba(201,168,76,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Leaf size={14} color="#c9a84c" />
          </div>
          <div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', color: '#f5e9c0', fontSize: 15, fontWeight: 600, letterSpacing: '0.1em', lineHeight: 1 }}>
              VARAM
            </div>
            <div style={{ color: 'rgba(201,168,76,0.7)', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2 }}>
              Admin Console
            </div>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', color: '#f5e9c0', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center' }}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ── MOBILE DRAWER ───────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed', inset: 0, top: 56,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
              zIndex: 34,
            }}
          />
          {/* Drawer panel */}
          <div
            style={{
              position: 'fixed', top: 56, left: 0, right: 0, bottom: 0,
              background: '#0B1A0E',
              borderTop: '1px solid rgba(201,168,76,0.12)',
              zIndex: 35,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Admin badge */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.2)',
                borderRadius: 6, padding: '5px 10px',
              }}>
                <Shield size={11} color="#c9a84c" />
                <span style={{ color: '#c9a84c', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Admin Access
                </span>
              </div>
            </div>

            {/* Nav links */}
            <nav style={{ flex: 1, padding: '12px 12px' }}>
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px',
                      borderRadius: 10, marginBottom: 4, textDecoration: 'none',
                      background: active ? 'rgba(201,168,76,0.1)' : 'transparent',
                      borderLeft: active ? '3px solid #c9a84c' : '3px solid transparent',
                      color: active ? '#f5e9c0' : 'rgba(245,233,192,0.5)',
                      fontSize: 15, fontWeight: active ? 600 : 400,
                    }}
                  >
                    <Icon size={20} style={{ flexShrink: 0 }} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User info + logout */}
            <div style={{ padding: '16px 20px 28px', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(201,168,76,0.15)',
                  border: '1.5px solid rgba(201,168,76,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#c9a84c', fontWeight: 700, fontSize: 15, flexShrink: 0,
                }}>
                  {adminName.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ color: '#f5e9c0', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {adminName}
                  </div>
                  <div style={{ color: 'rgba(245,233,192,0.4)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {adminEmail}
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '13px', borderRadius: 10,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#ef4444', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
