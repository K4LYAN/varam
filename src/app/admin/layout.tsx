import { redirect } from 'next/navigation';
import { createClient } from '../../utils/supabase/server';
import AdminSidebar from './_components/AdminSidebar';

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

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, sans-serif', background: '#0B1A0E', minHeight: '100vh' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <AdminSidebar adminName={user.user_metadata?.name ?? user.email ?? 'Admin'} adminEmail={user.email ?? ''} />
          <main style={{ flex: 1, overflowY: 'auto', background: '#0f1f13' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
