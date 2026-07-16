import { redirect } from 'next/navigation';
import { createClient } from '../../utils/supabase/server';
import AdminSidebar from './_components/AdminSidebar';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Console — Varam Organics',
  description: 'Admin dashboard for managing Varam Organics store.',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.is_admin !== true) {
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B1A0E', color: '#f5e9c0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <AdminSidebar adminName={user.user_metadata?.name ?? user.email ?? 'Admin'} adminEmail={user.email ?? ''} />
      
      <main style={{ flex: 1, overflowY: 'auto', background: '#0f1f13', display: 'flex', flexDirection: 'column' }}>
        {/* Persistent Admin Header Bar */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 36px',
          borderBottom: '1px solid rgba(201,168,76,0.12)',
          background: '#0B1A0E',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              color: 'rgba(245,233,192,0.45)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              System Status: 
              <span style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px #22c55e'
              }} />
              <strong style={{ color: '#22c55e', fontWeight: 600 }}>Operational</strong>
            </span>
            <span style={{ color: 'rgba(201,168,76,0.25)', fontSize: 12 }}>|</span>
            <span style={{ color: 'rgba(245,233,192,0.45)', fontSize: 12 }}>
              {systemDate}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link
              href="/"
              style={{
                color: '#c9a84c',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                border: '1.5px solid rgba(201,168,76,0.3)',
                padding: '8px 16px',
                borderRadius: 6,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              View Storefront →
            </Link>
          </div>
        </header>

        <div style={{ flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
