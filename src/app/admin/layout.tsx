import { redirect } from 'next/navigation';
import { requireAdmin } from '../../utils/supabase/admin';
import AdminSidebar from './_components/AdminSidebar';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Console — Varam Organics',
  description: 'Admin dashboard for managing Varam Organics store.',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/');
  }

  // Format system date
  const systemDate = new Date().toLocaleDateString('en-IN', { 
    weekday: 'short', 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <div className="admin-layout-container">
      <AdminSidebar adminName={user.user_metadata?.name ?? user.email ?? 'Admin'} adminEmail={user.email ?? ''} />
      
      <main style={{ flex: 1, overflowY: 'auto', background: '#0f1f13', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Desktop-only status bar */}
        <header className="admin-desktop-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 32px',
          borderBottom: '1px solid rgba(201,168,76,0.12)',
          background: '#0B1A0E',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              color: 'rgba(245,233,192,0.45)', fontSize: 12, fontWeight: 500,
              letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              System Status:
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
              <strong style={{ color: '#22c55e', fontWeight: 600 }}>Operational</strong>
            </span>
            <span style={{ color: 'rgba(201,168,76,0.25)', fontSize: 12 }}>|</span>
            <span style={{ color: 'rgba(245,233,192,0.45)', fontSize: 12 }}>{systemDate}</span>
          </div>
          <Link
            href="/"
            style={{
              color: '#c9a84c', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
              border: '1.5px solid rgba(201,168,76,0.3)', padding: '8px 16px',
              borderRadius: 6, background: 'transparent',
            }}
          >
            View Storefront →
          </Link>
        </header>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
