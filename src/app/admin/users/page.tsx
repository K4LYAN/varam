'use client';

import { useState, useEffect } from 'react';
import { Search, ShieldCheck, Shield, UserX, UserCheck, Trash2, Loader2, Mail, Calendar } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
  last_sign_in_at: string;
  email_confirmed_at: string;
  banned: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const patch = async (id: string, payload: object) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...payload }),
    });
    const data = await res.json();
    if (!res.ok) showToast(data.error ?? 'Action failed');
    else { showToast('Updated'); load(); }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) showToast(data.error ?? 'Delete failed');
    else { showToast('User deleted'); setDeleteConfirm(null); load(); }
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200 }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1a2e1f', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 8, padding: '12px 22px', color: '#f5e9c0', fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#f5e9c0', fontSize: 32, fontWeight: 500, margin: 0 }}>Users</h1>
        <p style={{ color: 'rgba(245,233,192,0.4)', marginTop: 6, fontSize: 13 }}>{users.length} registered users</p>
      </div>

      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 380 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(245,233,192,0.3)' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by email or name…"
          style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, color: '#f5e9c0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
          <Loader2 size={28} color="#c9a84c" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                {['User', 'Status', 'Joined', 'Last Login', 'Role', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(245,233,192,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '1.5px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9a84c', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {(u.name || u.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ color: '#f5e9c0', fontSize: 13, fontWeight: 600 }}>{u.name || '—'}</div>
                        <div style={{ color: 'rgba(245,233,192,0.4)', fontSize: 11 }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {u.banned
                      ? <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', borderRadius: 20, padding: '3px 10px', border: '1px solid rgba(239,68,68,0.3)' }}>Banned</span>
                      : u.email_confirmed_at
                        ? <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', borderRadius: 20, padding: '3px 10px', border: '1px solid rgba(34,197,94,0.3)' }}>Verified</span>
                        : <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', borderRadius: 20, padding: '3px 10px', border: '1px solid rgba(245,158,11,0.3)' }}>Unverified</span>
                    }
                  </td>
                  <td style={{ padding: '14px 16px', color: 'rgba(245,233,192,0.45)', fontSize: 11 }}>
                    {new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'rgba(245,233,192,0.45)', fontSize: 11 }}>
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => patch(u.id, { is_admin: !u.is_admin })}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: u.is_admin ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${u.is_admin ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: u.is_admin ? '#c9a84c' : 'rgba(245,233,192,0.4)', fontSize: 11, fontWeight: 600 }}
                    >
                      {u.is_admin ? <ShieldCheck size={13} /> : <Shield size={13} />}
                      {u.is_admin ? 'Admin' : 'User'}
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => patch(u.id, { ban: !u.banned })}
                        title={u.banned ? 'Unban user' : 'Ban user'}
                        style={{ background: u.banned ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${u.banned ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: u.banned ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center' }}
                      >
                        {u.banned ? <UserCheck size={13} /> : <UserX size={13} />}
                      </button>
                      {deleteConfirm === u.id ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => handleDelete(u.id)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#ef4444', fontSize: 11, fontWeight: 700 }}>Delete</button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: 'rgba(245,233,192,0.5)', fontSize: 11 }}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(u.id)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: 'rgba(245,233,192,0.25)', fontSize: 13 }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
