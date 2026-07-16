'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp, ShoppingBag, Package, MessageSquare, Users, ArrowRight,
  Clock, CheckCircle, AlertCircle, XCircle, Loader2
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  openTickets: number;
  totalUsers: number;
  recentOrders: any[];
  recentTickets: any[];
  ordersByStatus: Record<string, number>;
}

const STATUS_COLOR: Record<string, string> = {
  Processing: '#f59e0b',
  Confirmed: '#3b82f6',
  Shipped: '#8b5cf6',
  'Out for Delivery': '#06b6d4',
  Delivered: '#22c55e',
  Cancelled: '#ef4444',
};

const STATUS_ICON: Record<string, any> = {
  Processing: Clock,
  Delivered: CheckCircle,
  Cancelled: XCircle,
};

function StatCard({ label, value, icon: Icon, color, href, change }: any) {
  return (
    <Link href={href ?? '#'} style={{ textDecoration: 'none' }}>
      <div
        className="admin-card"
        style={{
          padding: '22px 24px', cursor: href ? 'pointer' : 'default',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="admin-stat-icon-wrapper" style={{
            width: 44, height: 44, borderRadius: 10, background: `${color}12`,
            border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={20} color={color} />
          </div>
          {change && (
            <span style={{
              fontSize: 11, fontWeight: 600, color: '#22c55e',
              background: 'rgba(34,197,94,0.1)', borderRadius: 20, padding: '2px 8px',
            }}>
              {change}
            </span>
          )}
        </div>
        <div>
          <div style={{ color: '#f5e9c0', fontSize: 26, fontWeight: 700, lineHeight: 1, fontFamily: 'Cormorant Garamond, serif' }}>
            {typeof value === 'number' && label.includes('Revenue') ? `₹${value.toLocaleString('en-IN')}` : value}
          </div>
          <div style={{ color: 'rgba(245,233,192,0.45)', fontSize: 12, marginTop: 4, letterSpacing: '0.05em' }}>
            {label}
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? '#8a8a7a';
  return (
    <span className="admin-badge" style={{ color, background: `${color}10` }}>
      <span className="admin-pulse-dot" />
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, productsRes, ticketsRes, usersRes] = await Promise.all([
          fetch('/api/admin/orders?limit=10'),
          fetch('/api/admin/products'),
          fetch('/api/admin/support?status=open'),
          fetch('/api/admin/users'),
        ]);
        const [ordersData, productsData, ticketsData, usersData] = await Promise.all([
          ordersRes.json(), productsRes.json(), ticketsRes.json(), usersRes.json(),
        ]);
        const orders = ordersData.orders ?? [];
        const products = productsData.products ?? [];
        const tickets = ticketsData.tickets ?? [];
        const users = usersData.users ?? [];
        const totalRevenue = orders.filter((o: any) => o.payment_status === 'paid')
          .reduce((sum: number, o: any) => sum + (o.total_amount ?? 0), 0);
        const ordersByStatus = orders.reduce((acc: any, o: any) => {
          acc[o.fulfillment_status] = (acc[o.fulfillment_status] ?? 0) + 1;
          return acc;
        }, {});
        setStats({
          totalRevenue,
          totalOrders: orders.length,
          totalProducts: products.length,
          openTickets: tickets.length,
          totalUsers: users.length,
          recentOrders: orders.slice(0, 8),
          recentTickets: tickets.slice(0, 5),
          ordersByStatus,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Loader2 size={32} color="#c9a84c" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 36px)', maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#f5e9c0', fontSize: 32, fontWeight: 500, margin: 0, lineHeight: 1 }}>
          Dashboard
        </h1>
        <p style={{ color: 'rgba(245,233,192,0.4)', marginTop: 8, fontSize: 13 }}>
          Welcome back. Here's what's happening with Varam today.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Revenue" value={stats?.totalRevenue ?? 0} icon={TrendingUp} color="#22c55e" href="/admin/orders" />
        <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} icon={ShoppingBag} color="#3b82f6" href="/admin/orders" />
        <StatCard label="Products" value={stats?.totalProducts ?? 0} icon={Package} color="#c9a84c" href="/admin/products" />
        <StatCard label="Open Tickets" value={stats?.openTickets ?? 0} icon={MessageSquare} color="#ef4444" href="/admin/support" />
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon={Users} color="#8b5cf6" href="/admin/users" />
      </div>

      {/* Main content grid */}
      <div className="admin-dashboard-grid">
        {/* Recent Orders */}
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(201,168,76,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: '#f5e9c0', fontSize: 15, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={16} color="#c9a84c" /> Recent Orders
            </h2>
            <Link href="/admin/orders" style={{ color: '#c9a84c', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="admin-table-container">
            {stats?.recentOrders?.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', color: 'rgba(245,233,192,0.3)', fontSize: 13 }}>
                No orders yet
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentOrders.map((order: any) => (
                    <tr key={order.id}>
                      <td style={{ color: '#f5e9c0', fontSize: 12, fontFamily: 'monospace' }}>
                        {order.id.slice(0, 8)}…
                      </td>
                      <td style={{ color: 'rgba(245,233,192,0.7)', fontSize: 12 }}>
                        {order.user_email ?? '—'}
                      </td>
                      <td style={{ color: '#f5e9c0', fontSize: 13, fontWeight: 600 }}>
                        ₹{(order.total_amount ?? 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <StatusBadge status={order.fulfillment_status} />
                      </td>
                      <td style={{ color: 'rgba(245,233,192,0.4)', fontSize: 11 }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Order Status Breakdown */}
          <div className="admin-card" style={{ padding: 24 }}>
            <h2 style={{ color: '#f5e9c0', fontSize: 15, fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} color="#c9a84c" /> Order Status
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(STATUS_COLOR).map(([status, color]) => {
                const count = stats?.ordersByStatus[status] ?? 0;
                const total = stats?.totalOrders ?? 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'rgba(245,233,192,0.6)', fontWeight: 500 }}>{status}</span>
                      <span style={{ fontSize: 11, color: '#f5e9c0', fontWeight: 700 }}>{count}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Open Support Tickets */}
          <div className="admin-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ color: '#f5e9c0', fontSize: 15, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={16} color="#ef4444" /> Open Tickets
              </h2>
              <Link href="/admin/support" style={{ color: '#c9a84c', fontSize: 12, textDecoration: 'none' }}>View all</Link>
            </div>
            {stats?.recentTickets?.length === 0 ? (
              <p style={{ color: 'rgba(245,233,192,0.3)', fontSize: 12, margin: 0 }}>No open tickets. 🎉</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats?.recentTickets.map((t: any) => (
                  <div key={t.id} style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.05)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.12)' }}>
                    <div style={{ color: '#f5e9c0', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{t.subject}</div>
                    <div style={{ color: 'rgba(245,233,192,0.4)', fontSize: 11 }}>{t.user_email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
