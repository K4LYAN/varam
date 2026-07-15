'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, X, ChevronDown, Loader2, Send } from 'lucide-react';

interface Ticket {
  id: number;
  user_email: string;
  user_name: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  admin_reply?: string;
  created_at: string;
}

const STATUS_COLOR: Record<string, string> = { open: '#ef4444', in_progress: '#f59e0b', resolved: '#22c55e', closed: '#8b5cf6' };
const PRIORITY_COLOR: Record<string, string> = { low: '#8a8a7a', normal: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' };
const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color, background: `${color}18`, borderRadius: 20, padding: '3px 10px', border: `1px solid ${color}30` }}>
      {label.replace('_', ' ')}
    </span>
  );
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set('status', filterStatus);
    const res = await fetch(`/api/admin/support?${params}`);
    const data = await res.json();
    setTickets(data.tickets ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [filterStatus]);

  const handleUpdate = async (id: number, updates: Partial<Ticket>) => {
    setSaving(true);
    const res = await fetch('/api/admin/support', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    setSaving(false);
    if (res.ok) { showToast('Ticket updated'); load(); setSelected(null); }
    else showToast('Update failed');
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/support?id=${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Ticket deleted'); load(); }
  };

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200 }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1a2e1f', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 8, padding: '12px 22px', color: '#f5e9c0', fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#f5e9c0', fontSize: 32, fontWeight: 500, margin: 0 }}>Support</h1>
          <p style={{ color: 'rgba(245,233,192,0.4)', marginTop: 6, fontSize: 13 }}>{tickets.length} tickets</p>
        </div>
        <select
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, color: '#f5e9c0', fontSize: 13, outline: 'none', cursor: 'pointer' }}
        >
          <option value="" style={{ background: '#0f1f13' }}>All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s} style={{ background: '#0f1f13' }}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
          <Loader2 size={28} color="#c9a84c" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tickets.map(t => (
            <div key={t.id}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 10, padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.3)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.12)'}
              onClick={() => { setSelected(t); setReply(t.admin_reply ?? ''); }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Badge label={t.status} color={STATUS_COLOR[t.status]} />
                    <Badge label={t.priority} color={PRIORITY_COLOR[t.priority]} />
                  </div>
                  <div style={{ color: '#f5e9c0', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{t.subject}</div>
                  <div style={{ color: 'rgba(245,233,192,0.45)', fontSize: 12 }}>{t.user_name} · {t.user_email}</div>
                  <div style={{ color: 'rgba(245,233,192,0.35)', fontSize: 12, marginTop: 6, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {t.message}
                  </div>
                </div>
                <div style={{ color: 'rgba(245,233,192,0.3)', fontSize: 11, flexShrink: 0 }}>
                  {new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </div>
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'rgba(245,233,192,0.25)', fontSize: 13 }}>
              No tickets found
            </div>
          )}
        </div>
      )}

      {/* Detail Slide-Over */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={{ width: 480, height: '100vh', background: '#0f1f13', borderLeft: '1px solid rgba(201,168,76,0.2)', overflow: 'auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ color: '#f5e9c0', fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 500, margin: 0 }}>Ticket #{selected.id}</h2>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <Badge label={selected.status} color={STATUS_COLOR[selected.status]} />
                  <Badge label={selected.priority} color={PRIORITY_COLOR[selected.priority]} />
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(245,233,192,0.4)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Customer Message */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 10, padding: 16 }}>
              <div style={{ color: 'rgba(245,233,192,0.4)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Subject</div>
              <div style={{ color: '#f5e9c0', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{selected.subject}</div>
              <div style={{ color: 'rgba(245,233,192,0.4)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Message</div>
              <div style={{ color: 'rgba(245,233,192,0.7)', fontSize: 13, lineHeight: 1.7 }}>{selected.message}</div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(245,233,192,0.35)', fontSize: 11 }}>
                From: {selected.user_name} · {selected.user_email}
              </div>
            </div>

            {/* Update controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ color: 'rgba(245,233,192,0.4)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>Status</div>
                <select
                  defaultValue={selected.status}
                  onChange={e => setSelected({ ...selected, status: e.target.value as any })}
                  style={{ width: '100%', padding: '9px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, color: '#f5e9c0', fontSize: 12, outline: 'none', cursor: 'pointer' }}
                >
                  {STATUSES.map(s => <option key={s} value={s} style={{ background: '#0f1f13' }}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <div style={{ color: 'rgba(245,233,192,0.4)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>Priority</div>
                <select
                  defaultValue={selected.priority}
                  onChange={e => setSelected({ ...selected, priority: e.target.value as any })}
                  style={{ width: '100%', padding: '9px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, color: '#f5e9c0', fontSize: 12, outline: 'none', cursor: 'pointer' }}
                >
                  {PRIORITIES.map(p => <option key={p} value={p} style={{ background: '#0f1f13' }}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Admin Reply */}
            <div>
              <div style={{ color: 'rgba(245,233,192,0.4)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Admin Reply</div>
              <textarea
                value={reply} onChange={e => setReply(e.target.value)}
                placeholder="Type your reply to the customer…"
                rows={5}
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, color: '#f5e9c0', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => handleUpdate(selected.id, { admin_reply: reply, status: selected.status, priority: selected.priority })}
                disabled={saving}
                style={{ flex: 2, padding: '11px', background: '#c9a84c', border: 'none', borderRadius: 8, color: '#0B1A0E', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Send size={14} /> {saving ? 'Saving…' : 'Save & Reply'}
              </button>
              <button
                onClick={() => handleDelete(selected.id)}
                style={{ flex: 1, padding: '11px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
