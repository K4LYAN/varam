'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight, X, Loader2, Package } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  volume: string;
  category: string;
  description: string;
  image: string;
  image_color: string;
  accent_color: string;
  benefits: string[];
  in_stock: boolean;
  created_at: string;
}

const EMPTY: Omit<Product, 'id' | 'created_at'> = {
  name: '', price: 0, volume: '', category: '', description: '',
  image: '', image_color: 'bg-[#F3E5AB]', accent_color: 'text-[#8B5A2B]',
  benefits: [], in_stock: true,
};

const STATUS_COLOR = { true: '#22c55e', false: '#ef4444' };

function Input({ label, ...props }: any) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', color: 'rgba(245,233,192,0.5)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </label>
      <input
        {...props}
        style={{
          width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, color: '#f5e9c0',
          fontSize: 13, outline: 'none', boxSizing: 'border-box', ...props.style,
        }}
        onFocus={e => (e.target.style.borderColor = 'rgba(201,168,76,0.6)')}
        onBlur={e => (e.target.style.borderColor = 'rgba(201,168,76,0.2)')}
      />
    </div>
  );
}

function Textarea({ label, ...props }: any) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', color: 'rgba(245,233,192,0.5)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </label>
      <textarea
        {...props}
        style={{
          width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, color: '#f5e9c0',
          fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 90, boxSizing: 'border-box',
        }}
        onFocus={e => (e.target.style.borderColor = 'rgba(201,168,76,0.6)')}
        onBlur={e => (e.target.style.borderColor = 'rgba(201,168,76,0.2)')}
      />
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [benefitsInput, setBenefitsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadProducts = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/products');
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  };
  useEffect(() => { loadProducts(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setBenefitsInput('');
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, price: p.price, volume: p.volume, category: p.category, description: p.description, image: p.image, image_color: p.image_color, accent_color: p.accent_color, benefits: p.benefits, in_stock: p.in_stock });
    setBenefitsInput(p.benefits.join(', '));
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.description) return showToast('Please fill all required fields');
    setSaving(true);
    const payload = { ...form, benefits: benefitsInput.split(',').map(b => b.trim()).filter(Boolean) };
    const res = await fetch('/api/admin/products', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
    });
    setSaving(false);
    if (res.ok) {
      showToast(editing ? 'Product updated!' : 'Product added!');
      setShowModal(false);
      loadProducts();
    } else {
      showToast('Failed to save product');
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Product deleted'); setDeleteConfirm(null); loadProducts(); }
    else showToast('Delete failed');
  };

  const toggleStock = async (p: Product) => {
    await fetch('/api/admin/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, in_stock: !p.in_stock }),
    });
    loadProducts();
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const s = (x: any) => ({ style: x });

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200 }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: '#1a2e1f', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 8,
          padding: '12px 22px', color: '#f5e9c0', fontSize: 13, fontWeight: 500, zIndex: 9999,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#f5e9c0', fontSize: 32, fontWeight: 500, margin: 0 }}>
            Products
          </h1>
          <p style={{ color: 'rgba(245,233,192,0.4)', marginTop: 6, fontSize: 13 }}>
            {products.length} product{products.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px',
            background: '#c9a84c', border: 'none', borderRadius: 8, color: '#0B1A0E',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em',
          }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 380 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(245,233,192,0.3)' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products…"
          style={{
            width: '100%', padding: '10px 12px 10px 36px', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, color: '#f5e9c0',
            fontSize: 13, outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
          <Loader2 size={28} color="#c9a84c" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                {['Product', 'Category', 'Price', 'Volume', 'Stock', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(245,233,192,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Package size={16} color="#c9a84c" />
                      </div>
                      <div>
                        <div style={{ color: '#f5e9c0', fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                        <div style={{ color: 'rgba(245,233,192,0.35)', fontSize: 11, marginTop: 2 }}>ID: {p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'rgba(245,233,192,0.55)', fontSize: 12 }}>{p.category}</td>
                  <td style={{ padding: '14px 16px', color: '#f5e9c0', fontSize: 14, fontWeight: 700 }}>₹{p.price}</td>
                  <td style={{ padding: '14px 16px', color: 'rgba(245,233,192,0.55)', fontSize: 12 }}>{p.volume}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <button onClick={() => toggleStock(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {p.in_stock
                        ? <ToggleRight size={22} color="#22c55e" />
                        : <ToggleLeft size={22} color="#ef4444" />
                      }
                      <span style={{ fontSize: 11, fontWeight: 600, color: p.in_stock ? '#22c55e' : '#ef4444' }}>
                        {p.in_stock ? 'In Stock' : 'Out'}
                      </span>
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(p)} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center' }}>
                        <Pencil size={13} />
                      </button>
                      {deleteConfirm === p.id ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => handleDelete(p.id)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#ef4444', fontSize: 11, fontWeight: 700 }}>Confirm</button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: 'rgba(245,233,192,0.5)', fontSize: 11 }}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(p.id)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: 'rgba(245,233,192,0.25)', fontSize: 13 }}>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{
            background: '#0f1f13', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 16,
            padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ color: '#f5e9c0', fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 500, margin: 0 }}>
                {editing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(245,233,192,0.4)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <Input label="Product Name *" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} placeholder="Wood Pressed Groundnut Oil" />
              </div>
              <Input label="Price (₹) *" type="number" value={form.price} onChange={(e: any) => setForm({ ...form, price: parseInt(e.target.value) })} placeholder="350" />
              <Input label="Volume *" value={form.volume} onChange={(e: any) => setForm({ ...form, volume: e.target.value })} placeholder="1 Liter" />
              <div style={{ gridColumn: '1/-1' }}>
                <Input label="Category" value={form.category} onChange={(e: any) => setForm({ ...form, category: e.target.value })} placeholder="Everyday Cooking" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <Textarea label="Description *" value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} placeholder="Product description…" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <Input label="Image Path" value={form.image} onChange={(e: any) => setForm({ ...form, image: e.target.value })} placeholder="/images/groundnut_oil.png" />
              </div>
              <Input label="Image BG Color Class" value={form.image_color} onChange={(e: any) => setForm({ ...form, image_color: e.target.value })} placeholder="bg-[#F3E5AB]" />
              <Input label="Accent Color Class" value={form.accent_color} onChange={(e: any) => setForm({ ...form, accent_color: e.target.value })} placeholder="text-[#8B5A2B]" />
              <div style={{ gridColumn: '1/-1' }}>
                <Input label="Benefits (comma-separated)" value={benefitsInput} onChange={(e: any) => setBenefitsInput(e.target.value)} placeholder="Rich in Vitamin E, Cholesterol Free" />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <label style={{ color: 'rgba(245,233,192,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>In Stock</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, in_stock: !form.in_stock })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {form.in_stock
                    ? <ToggleRight size={28} color="#22c55e" />
                    : <ToggleLeft size={28} color="#ef4444" />
                  }
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid rgba(201,168,76,0.1)' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(245,233,192,0.6)', fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 2, padding: '11px', background: '#c9a84c', border: 'none', borderRadius: 8, color: '#0B1A0E', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : (editing ? 'Update Product' : 'Add Product')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
