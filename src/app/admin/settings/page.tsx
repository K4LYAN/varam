'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Globe, Truck, Megaphone, Info } from 'lucide-react';

interface Settings {
  business_name: string;
  business_gstin: string;
  business_address: string;
  business_email: string;
  business_phone: string;
  shipping_fee: string;
  free_shipping_threshold: string;
  announcement_enabled: string;
  announcement_text: string;
}

const DEFAULT: Settings = {
  business_name: '', business_gstin: '', business_address: '',
  business_email: '', business_phone: '', shipping_fee: '50',
  free_shipping_threshold: '999', announcement_enabled: 'false', announcement_text: '',
};

function Section({ title, icon: Icon, children }: any) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(201,168,76,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon size={16} color="#c9a84c" />
        <h2 style={{ color: '#f5e9c0', fontSize: 15, fontWeight: 600, margin: 0 }}>{title}</h2>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: any) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', color: 'rgba(245,233,192,0.5)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {hint && <div style={{ color: 'rgba(245,233,192,0.25)', fontSize: 11, marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, color: '#f5e9c0',
  fontSize: 13, outline: 'none', boxSizing: 'border-box' as const,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({ ...DEFAULT });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      if (d.settings) setSettings({ ...DEFAULT, ...d.settings });
      setLoading(false);
    });
  }, []);

  const set = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (res.ok) showToast('Settings saved successfully!');
    else showToast('Failed to save settings');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Loader2 size={28} color="#c9a84c" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 780 }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1a2e1f', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 8, padding: '12px 22px', color: '#f5e9c0', fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#f5e9c0', fontSize: 32, fontWeight: 500, margin: 0 }}>Site Settings</h1>
          <p style={{ color: 'rgba(245,233,192,0.4)', marginTop: 6, fontSize: 13 }}>Configure store-wide settings and business info.</p>
        </div>
        <button
          onClick={handleSave} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: '#c9a84c', border: 'none', borderRadius: 8, color: '#0B1A0E', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      {/* Business Info */}
      <Section title="Business Information" icon={Globe}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Field label="Business Name">
            <input value={settings.business_name} onChange={set('business_name')} style={inputStyle} placeholder="Organic Varam Pvt Ltd." />
          </Field>
          <Field label="GSTIN">
            <input value={settings.business_gstin} onChange={set('business_gstin')} style={inputStyle} placeholder="29XXXXX1234X1ZX" />
          </Field>
          <Field label="Support Email">
            <input type="email" value={settings.business_email} onChange={set('business_email')} style={inputStyle} placeholder="support@varamorganics.com" />
          </Field>
          <Field label="Phone Number">
            <input value={settings.business_phone} onChange={set('business_phone')} style={inputStyle} placeholder="+91 98765 43210" />
          </Field>
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="Business Address" hint="Shown on invoices">
              <textarea value={settings.business_address} onChange={set('business_address')} rows={2}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} placeholder="123 Heritage Farm Road, Agriculture District, 500001" />
            </Field>
          </div>
        </div>
      </Section>

      {/* Shipping */}
      <Section title="Shipping Configuration" icon={Truck}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Field label="Shipping Fee (₹)" hint="Applied when below free shipping threshold">
            <input type="number" value={settings.shipping_fee} onChange={set('shipping_fee')} style={inputStyle} min="0" />
          </Field>
          <Field label="Free Shipping Threshold (₹)" hint="Orders above this amount get free shipping">
            <input type="number" value={settings.free_shipping_threshold} onChange={set('free_shipping_threshold')} style={inputStyle} min="0" />
          </Field>
        </div>
      </Section>

      {/* Announcement Banner */}
      <Section title="Announcement Banner" icon={Megaphone}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setSettings(prev => ({ ...prev, announcement_enabled: prev.announcement_enabled === 'true' ? 'false' : 'true' }))}
            style={{
              width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative',
              background: settings.announcement_enabled === 'true' ? '#c9a84c' : 'rgba(255,255,255,0.1)',
              transition: 'background 0.2s',
            }}
          >
            <span style={{
              position: 'absolute', top: 3, left: settings.announcement_enabled === 'true' ? 23 : 3,
              width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s',
            }} />
          </button>
          <span style={{ color: settings.announcement_enabled === 'true' ? '#c9a84c' : 'rgba(245,233,192,0.4)', fontSize: 13, fontWeight: 600 }}>
            {settings.announcement_enabled === 'true' ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <Field label="Banner Text" hint="Shown at the top of all public pages when enabled">
          <input
            value={settings.announcement_text} onChange={set('announcement_text')}
            style={{ ...inputStyle, opacity: settings.announcement_enabled === 'true' ? 1 : 0.4 }}
            placeholder="Free shipping on orders above ₹999!"
            disabled={settings.announcement_enabled !== 'true'}
          />
        </Field>
      </Section>

      <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Info size={14} color="#c9a84c" style={{ marginTop: 1, flexShrink: 0 }} />
        <p style={{ color: 'rgba(245,233,192,0.5)', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
          Changes are applied immediately on save. Shipping fee changes affect new orders only. Invoice information updates will reflect on all future tax invoices.
        </p>
      </div>
    </div>
  );
}
