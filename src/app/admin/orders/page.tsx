'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronDown, X, Loader2, ShoppingBag, MapPin, Calendar } from 'lucide-react';

interface Order {
  id: string;
  user_email: string;
  total_amount: number;
  payment_status: string;
  fulfillment_status: string;
  shipping_address: any;
  items: any[];
  created_at: string;
}

const STATUSES = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
const STATUS_COLOR: Record<string, string> = {
  Processing: '#f59e0b', Confirmed: '#3b82f6', Shipped: '#8b5cf6',
  'Out for Delivery': '#06b6d4', Delivered: '#22c55e', Cancelled: '#ef4444',
};
const PAY_COLOR: Record<string, string> = { paid: '#22c55e', pending: '#f59e0b', failed: '#ef4444', refunded: '#8b5cf6' };

function StatusBadge({ status, color }: { status: string; color: string }) {
  return (
    <span className="admin-badge" style={{ color, background: `${color}10` }}>
      <span className="admin-pulse-dot" />
      {status}
    </span>
  );
}

function OrderDetail({ order, onClose, onStatusChange }: { order: Order; onClose: () => void; onStatusChange: (id: string, status: string) => void }) {
  const [status, setStatus] = useState(order.fulfillment_status);
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    setSaving(true);
    await fetch('/api/admin/orders', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: order.id, fulfillment_status: status }),
    });
    setSaving(false);
    onStatusChange(order.id, status);
    onClose();
  };

  const addr = order.shipping_address ?? {};

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: 440, height: '100vh', background: '#0f1f13', borderLeft: '1px solid rgba(201,168,76,0.2)', overflow: 'auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ color: '#f5e9c0', fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 500, margin: 0 }}>Order Detail</h2>
            <div style={{ color: 'rgba(245,233,192,0.35)', fontSize: 11, marginTop: 4, fontFamily: 'monospace' }}>{order.id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(245,233,192,0.4)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {/* Customer */}
        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ color: 'rgba(245,233,192,0.4)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Customer</div>
          <div style={{ color: '#f5e9c0', fontSize: 13, fontWeight: 600 }}>{addr.fullName ?? '—'}</div>
          <div style={{ color: 'rgba(245,233,192,0.5)', fontSize: 12, marginTop: 4 }}>{order.user_email}</div>
          <div style={{ color: 'rgba(245,233,192,0.4)', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <MapPin size={12} style={{ marginTop: 1, flexShrink: 0 }} />
            <span>{[addr.address, addr.city, addr.pincode].filter(Boolean).join(', ') || '—'}</span>
          </div>
          <div style={{ color: 'rgba(245,233,192,0.4)', fontSize: 12, marginTop: 2 }}>Ph: {addr.phone ?? '—'}</div>
        </div>

        {/* Items */}
        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ color: 'rgba(245,233,192,0.4)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Order Items</div>
          {(Array.isArray(order.items) ? order.items : []).map((item: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {item.image && (
                <img src={item.image} alt={item.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, background: '#1c1c1c' }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ color: '#f5e9c0', fontSize: 12, fontWeight: 500 }}>{item.name || `Item #${item.id}`}</div>
                <div style={{ color: 'rgba(245,233,192,0.4)', fontSize: 11 }}>Qty: {item.quantity} {item.price ? `• ₹${item.price}` : ''}</div>
              </div>
              {item.price && (
                <div style={{ color: '#f5e9c0', fontSize: 12, fontWeight: 600 }}>
                  ₹{item.price * item.quantity}
                </div>
              )}
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, marginTop: 4 }}>
            <span style={{ color: 'rgba(245,233,192,0.5)', fontSize: 12 }}>Total</span>
            <span style={{ color: '#f5e9c0', fontSize: 16, fontWeight: 700, fontFamily: 'Cormorant Garamond, serif' }}>
              ₹{(order.total_amount ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Status + Payment */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="admin-card" style={{ padding: 14 }}>
            <div style={{ color: 'rgba(245,233,192,0.4)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>Payment</div>
            <StatusBadge status={order.payment_status} color={PAY_COLOR[order.payment_status] ?? '#8a8a7a'} />
          </div>
          <div className="admin-card" style={{ padding: 14 }}>
            <div style={{ color: 'rgba(245,233,192,0.4)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>Date</div>
            <div style={{ color: '#f5e9c0', fontSize: 12, fontWeight: 500 }}>
              {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Update Status */}
        <div className="admin-card" style={{ padding: 16 }}>
          <div style={{ color: 'rgba(245,233,192,0.4)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Update Status</div>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 8, color: '#f5e9c0', fontSize: 13, outline: 'none', cursor: 'pointer' }}
          >
            {STATUSES.map(s => <option key={s} value={s} style={{ background: '#0f1f13' }}>{s}</option>)}
          </select>
          <button
            onClick={handleUpdate} disabled={saving || status === order.fulfillment_status}
            style={{ marginTop: 10, width: '100%', padding: 11, background: status === order.fulfillment_status ? 'rgba(201,168,76,0.2)' : '#c9a84c', border: 'none', borderRadius: 8, color: '#0B1A0E', fontSize: 13, fontWeight: 700, cursor: saving || status === order.fulfillment_status ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'Updating…' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set('status', filterStatus);
    if (search) params.set('search', search);
    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [filterStatus]);

  const handleSearch = (e: React.KeyboardEvent) => { if (e.key === 'Enter') load(); };

  const handleStatusChange = (id: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, fulfillment_status: status } : o));
  };

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 36px)', maxWidth: 1200 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#f5e9c0', fontSize: 32, fontWeight: 500, margin: 0 }}>Orders</h1>
        <p style={{ color: 'rgba(245,233,192,0.4)', marginTop: 6, fontSize: 13 }}>{orders.length} orders</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(245,233,192,0.3)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch}
            placeholder="Search by order ID or email…"
            style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, color: '#f5e9c0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <select
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, color: '#f5e9c0', fontSize: 13, outline: 'none', cursor: 'pointer' }}
        >
          <option value="" style={{ background: '#0f1f13' }}>All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s} style={{ background: '#0f1f13' }}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
          <Loader2 size={28} color="#c9a84c" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  {['Order ID', 'Customer', 'Amount', 'Payment', 'Status', 'Date', ''].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td style={{ color: '#f5e9c0', fontSize: 11, fontFamily: 'monospace' }}>{order.id.slice(0, 8)}…</td>
                    <td style={{ color: 'rgba(245,233,192,0.6)', fontSize: 12 }}>{order.user_email ?? '—'}</td>
                    <td style={{ color: '#f5e9c0', fontSize: 14, fontWeight: 700 }}>₹{(order.total_amount ?? 0).toLocaleString('en-IN')}</td>
                    <td><StatusBadge status={order.payment_status} color={PAY_COLOR[order.payment_status] ?? '#8a8a7a'} /></td>
                    <td><StatusBadge status={order.fulfillment_status} color={STATUS_COLOR[order.fulfillment_status] ?? '#8a8a7a'} /></td>
                    <td style={{ color: 'rgba(245,233,192,0.4)', fontSize: 11 }}>
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelected(order)}
                        style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', color: '#c9a84c', fontSize: 11, fontWeight: 600 }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: 'rgba(245,233,192,0.25)', fontSize: 13 }}>No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <OrderDetail order={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
