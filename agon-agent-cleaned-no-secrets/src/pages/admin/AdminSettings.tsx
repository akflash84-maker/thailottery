import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, CheckCircle, Upload, X, Image, AlertCircle,
  Crown, RefreshCw, Globe, QrCode, Trash2, Eye, EyeOff,
  Link as LinkIcon, Copy
} from 'lucide-react';
import { useLogo } from '../../hooks/useLogo';

interface SettingsMap { [key: string]: string; }

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_LOGO = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
const ALLOWED_QR   = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// ── Reusable file upload hook ──
function useFileUpload() {
  const [file, setFile]       = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus]   = useState<'idle'|'success'|'error'>('idle');
  const [error, setError]     = useState('');

  const handleFile = useCallback((f: File, allowed: string[]) => {
    setError(''); setStatus('idle');
    if (!allowed.includes(f.type)) { setError(`Invalid type: ${f.type}`); return; }
    if (f.size > MAX_FILE_SIZE)    { setError('File too large. Max 5MB.'); return; }
    setFile(f);
    if (!f.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview('');
    }
  }, []);

  const reset = () => { setFile(null); setPreview(''); setStatus('idle'); setError(''); };

  return { file, preview, dragging, setDragging, uploading, setUploading, status, setStatus, error, setError, handleFile, reset };
}

// ── Spin animation style ──
const spinStyle: React.CSSProperties = {
  width: 14, height: 14,
  border: '2px solid currentColor',
  borderTopColor: 'transparent',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
  display: 'inline-block',
};

// ── Input style ──
const inp: React.CSSProperties = {
  width: '100%', padding: '10px 13px', borderRadius: '10px',
  background: 'rgba(10,14,26,0.8)', border: '1px solid rgba(212,175,55,0.2)',
  color: '#F0EDE4', fontSize: '0.85rem', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
};
const inpFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = 'rgba(212,175,55,0.55)';
  e.target.style.boxShadow   = '0 0 0 3px rgba(212,175,55,0.08)';
};
const inpBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = 'rgba(212,175,55,0.2)';
  e.target.style.boxShadow   = 'none';
};

// ── Section wrapper ──
function Section({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(19,27,46,0.7)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '20px', padding: 'clamp(18px,3vw,28px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <h3 className="font-luxury" style={{ fontSize: '0.8rem', color: '#D4AF37', letterSpacing: '0.1em' }}>{title}</h3>
          {subtitle && <p style={{ fontSize: '0.72rem', color: '#8A9BB0', marginTop: '3px' }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Drop zone ──
function DropZone({
  allowed, label, hint, onFile, dragging, setDragging, inputRef,
}: {
  allowed: string[]; label: string; hint: string;
  onFile: (f: File) => void;
  dragging: boolean; setDragging: (v: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  const zoneRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={zoneRef}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={e => { if (!zoneRef.current?.contains(e.relatedTarget as Node)) setDragging(false); }}
      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? '#D4AF37' : 'rgba(212,175,55,0.25)'}`,
        borderRadius: '14px', padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
        background: dragging ? 'rgba(212,175,55,0.06)' : 'rgba(10,14,26,0.4)',
        transition: 'all 0.25s',
        boxShadow: dragging ? '0 0 24px rgba(212,175,55,0.15)' : 'none',
      }}
    >
      <input ref={inputRef} type="file" accept={allowed.join(',')} style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
      <motion.div animate={{ scale: dragging ? 1.06 : 1 }}>
        <Upload size={28} color={dragging ? '#D4AF37' : '#8A9BB0'} style={{ margin: '0 auto 10px' }} />
        <p style={{ fontSize: '0.85rem', color: dragging ? '#D4AF37' : '#F0EDE4', fontWeight: 600, marginBottom: '4px' }}>
          {dragging ? 'Drop here!' : label}
        </p>
        <p style={{ fontSize: '0.72rem', color: '#8A9BB0' }}>
          or <span style={{ color: '#D4AF37', textDecoration: 'underline' }}>click to browse</span>
        </p>
        <p style={{ fontSize: '0.65rem', color: '#8A9BB0', marginTop: '6px' }}>{hint}</p>
      </motion.div>
    </div>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [saveError, setSaveError] = useState('');
  const [copiedKey, setCopiedKey] = useState('');
  const [showDomain, setShowDomain] = useState(false);

  // Logo
  const logo = useFileUpload();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { logoUrl, setLogoUrl, refreshLogo } = useLogo();

  // QR
  const qr = useFileUpload();
  const qrInputRef = useRef<HTMLInputElement>(null);
  const [qrUrl, setQrUrl] = useState('');
  const [qrDeleting, setQrDeleting] = useState(false);

  // ── Fetch settings ──
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await fetch(`/api/settings?_t=${Date.now()}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }).then(r => r.json());
      const defaults: SettingsMap = {
        site_name: 'Thai Lottery Premium Service',
        whatsapp_number: '919912079906',
        email: 'vijaythai456@gmail.com',
        upi_id: 'vijaythai456@upi',
        bank_name: 'HDFC Bank',
        account_name: 'Vijay Thai Lottery',
        account_no: '50100123456789',
        ifsc: 'HDFC0001234',
        hero_title: 'Win Big. Live Royally.',
        hero_subtitle: "Thailand's most accurate lottery predictions.",
        qr_code_url: '',
        qr_storage_path: '',
        site_domain: '',
        site_base_url: '',
        logo_url: '',
      };
      const merged = { ...defaults, ...data };
      setSettings(merged);
      setQrUrl(merged.qr_code_url || '');
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const update = (key: string, value: string) => setSettings(s => ({ ...s, [key]: value }));

  // ── Save all text settings ──
  const handleSave = async () => {
    setSaving(true); setSaveError('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
        // Re-fetch to confirm data was saved correctly
        await fetchSettings();
      } else {
        const d = await res.json().catch(() => ({}));
        setSaveError(d.error || 'Save failed. Please try again.');
      }
    } catch { setSaveError('Network error. Please check connection.'); }
    setSaving(false);
  };

  // ── Upload Logo ──
  const uploadLogo = async () => {
    if (!logo.file) return;
    logo.setUploading(true); logo.setStatus('idle'); logo.setError('');
    try {
      const fd = new FormData();
      fd.append('file', logo.file);
      const res = await fetch('/api/logo-upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setLogoUrl(data.url);
        logo.setStatus('success');
        logo.reset();
        await refreshLogo();
      } else {
        logo.setError(data.error || 'Upload failed');
        logo.setStatus('error');
      }
    } catch { logo.setError('Network error.'); logo.setStatus('error'); }
    logo.setUploading(false);
  };

  const removeLogo = async () => {
    if (!confirm('Remove the current logo? The default icon will be shown.')) return;
    logo.setUploading(true);
    try {
      await fetch('/api/logo-upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: '' }) });
      setLogoUrl(''); logo.reset();
    } catch { }
    logo.setUploading(false);
  };

  // ── Upload QR ──
  const uploadQR = async () => {
    if (!qr.file) return;
    qr.setUploading(true); qr.setStatus('idle'); qr.setError('');
    try {
      const fd = new FormData();
      fd.append('file', qr.file);
      const res = await fetch('/api/qr-upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setQrUrl(data.url);
        update('qr_code_url', data.url);
        update('qr_storage_path', data.path || '');
        qr.setStatus('success');
        qr.reset();
      } else {
        qr.setError(data.error || 'Upload failed');
        qr.setStatus('error');
      }
    } catch { qr.setError('Network error.'); qr.setStatus('error'); }
    qr.setUploading(false);
  };

  const deleteQR = async () => {
    if (!confirm('Delete the current QR code? Customers will not see a QR on the payment page.')) return;
    setQrDeleting(true);
    try {
      const res = await fetch('/api/qr-upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        setQrUrl('');
        update('qr_code_url', '');
        update('qr_storage_path', '');
      }
    } catch { }
    setQrDeleting(false);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  // ── Save button ──
  const SaveBtn = ({ bottom }: { bottom?: boolean }) => (
    <button onClick={handleSave} disabled={saving}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: bottom ? '12px 32px' : '8px 20px',
        borderRadius: '12px', cursor: saving ? 'not-allowed' : 'pointer', border: 'none',
        background: saved ? 'rgba(34,197,94,0.18)' : 'linear-gradient(135deg,#B8860B,#D4AF37)',
        color: saved ? '#22C55E' : '#000',
        fontFamily: 'Cinzel,serif', fontSize: bottom ? '0.85rem' : '0.75rem',
        fontWeight: 700, letterSpacing: '0.06em',
        boxShadow: saved ? '0 0 16px rgba(34,197,94,0.2)' : '0 0 20px rgba(212,175,55,0.25)',
        outline: saved ? '1px solid rgba(34,197,94,0.35)' : 'none',
      } as React.CSSProperties}>
      {saved
        ? <><CheckCircle size={bottom ? 16 : 13} /> All Saved!</>
        : saving
          ? <><span style={spinStyle} /> Saving…</>
          : <><Save size={bottom ? 16 : 13} /> {bottom ? 'Save All Settings' : 'Save All'}</>}
    </button>
  );

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '14px' }}>
      <div style={{ width: 38, height: 38, border: '2px solid #D4AF37', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#8A9BB0', fontSize: '0.82rem', fontFamily: 'Cinzel,serif' }}>Loading settings…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '960px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 className="font-luxury" style={{ fontSize: 'clamp(1rem,2.5vw,1.25rem)', color: '#F0EDE4' }}>Admin Settings</h2>
          <p style={{ fontSize: '0.75rem', color: '#8A9BB0', marginTop: '3px' }}>All changes are saved to the database and reflect instantly.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={fetchSettings}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', fontSize: '0.75rem', cursor: 'pointer' }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <SaveBtn />
        </div>
      </div>

      {saveError && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={15} /> {saveError}
        </motion.div>
      )}

      {/* ══════════════════════════════════════════
          1. LOGO UPLOAD
      ══════════════════════════════════════════ */}
      <Section icon={<Image size={16} color="#D4AF37" />} title="LOGO UPLOAD" subtitle="Header, footer & admin login. PNG · JPG · SVG · WebP · Max 5MB">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: '20px', alignItems: 'start' }}>

          {/* Current logo */}
          <div>
            <p style={{ fontSize: '0.7rem', color: '#8A9BB0', marginBottom: '10px', letterSpacing: '0.05em' }}>CURRENT LOGO</p>
            <div style={{ width: '100%', maxWidth: '280px', height: '110px', borderRadius: '14px', border: '1px solid rgba(212,175,55,0.2)', background: 'rgba(10,14,26,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
              {logoUrl ? (
                <>
                  <img src={logoUrl} alt="Site logo" style={{ maxWidth: '85%', maxHeight: '80px', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <button onClick={removeLogo} disabled={logo.uploading} title="Remove logo"
                    style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', background: 'rgba(239,68,68,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={12} color="#fff" />
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#B8860B,#D4AF37)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    <Crown size={18} color="#000" />
                  </div>
                  <p style={{ fontSize: '0.7rem', color: '#8A9BB0' }}>Default icon active</p>
                </div>
              )}
            </div>
          </div>

          {/* Upload new logo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '0.7rem', color: '#8A9BB0', letterSpacing: '0.05em' }}>UPLOAD NEW LOGO</p>

            {logo.file && logo.preview ? (
              <div style={{ background: 'rgba(10,14,26,0.5)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(34,197,94,0.3)', textAlign: 'center' }}>
                <img src={logo.preview} alt="Preview" style={{ maxHeight: '70px', maxWidth: '200px', objectFit: 'contain', margin: '0 auto 10px', display: 'block' }} />
                <p style={{ fontSize: '0.78rem', color: '#F0EDE4', fontWeight: 500, marginBottom: '3px' }}>{logo.file.name}</p>
                <p style={{ fontSize: '0.68rem', color: '#8A9BB0', marginBottom: '12px' }}>{(logo.file.size / 1024).toFixed(0)} KB</p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={uploadLogo} disabled={logo.uploading}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '8px', background: 'linear-gradient(135deg,#B8860B,#D4AF37)', color: '#000', fontFamily: 'Cinzel,serif', fontSize: '0.72rem', fontWeight: 700, cursor: logo.uploading ? 'not-allowed' : 'pointer', border: 'none' }}>
                    {logo.uploading ? <><span style={{ ...spinStyle, borderColor: '#000', borderTopColor: 'transparent' }} />Uploading…</> : <><Upload size={12} />Upload Logo</>}
                  </button>
                  <button onClick={logo.reset} style={{ padding: '8px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', fontSize: '0.72rem', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <DropZone allowed={ALLOWED_LOGO} label="Drag & drop logo" hint="PNG · JPG · SVG · WebP · Max 5MB"
                onFile={f => logo.handleFile(f, ALLOWED_LOGO)}
                dragging={logo.dragging} setDragging={logo.setDragging} inputRef={logoInputRef as React.RefObject<HTMLInputElement>} />
            )}

            <AnimatePresence>
              {logo.status === 'success' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={13} /> Logo uploaded! Now live on all pages.
                </motion.div>
              )}
              {(logo.error || logo.status === 'error') && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={13} /> {logo.error || 'Upload failed.'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════
          2. QR CODE UPLOAD (PAYMENT SETTINGS)
      ══════════════════════════════════════════ */}
      <Section icon={<QrCode size={16} color="#D4AF37" />} title="PAYMENT QR CODE" subtitle="Displayed on the payment page for customers to scan and pay. PNG · JPG · WebP · Max 5MB">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: '24px', alignItems: 'start' }}>

          {/* Current QR preview */}
          <div>
            <p style={{ fontSize: '0.7rem', color: '#8A9BB0', marginBottom: '10px', letterSpacing: '0.05em' }}>CURRENT QR CODE</p>
            <div style={{ width: '100%', maxWidth: '220px', height: '220px', borderRadius: '16px', border: `2px solid ${qrUrl ? 'rgba(212,175,55,0.4)' : 'rgba(212,175,55,0.15)'}`, background: 'rgba(255,255,255,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
              {qrUrl ? (
                <>
                  <img src={qrUrl} alt="Payment QR Code"
                    style={{ width: '90%', height: '90%', objectFit: 'contain' }}
                    onError={e => { (e.target as HTMLImageElement).src = ''; setQrUrl(''); }} />
                  <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: '4px' }}>
                    <a href={qrUrl} target="_blank" rel="noopener noreferrer"
                      style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(212,175,55,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                      <Eye size={13} color="#000" />
                    </a>
                    <button onClick={deleteQR} disabled={qrDeleting}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(239,68,68,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {qrDeleting ? <span style={{ ...spinStyle, width: 12, height: 12, borderColor: '#fff', borderTopColor: 'transparent' }} /> : <Trash2 size={13} color="#fff" />}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <QrCode size={48} color="rgba(0,0,0,0.15)" style={{ margin: '0 auto 10px' }} />
                  <p style={{ fontSize: '0.75rem', color: '#888' }}>No QR code uploaded</p>
                  <p style={{ fontSize: '0.65rem', color: '#aaa', marginTop: '4px' }}>Customers will see UPI ID instead</p>
                </div>
              )}
            </div>

            {qrUrl && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.68rem', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={11} /> Live on payment page
                </span>
                <button onClick={() => copyToClipboard(qrUrl, 'qr')}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37', fontSize: '0.65rem', cursor: 'pointer' }}>
                  {copiedKey === 'qr' ? <><CheckCircle size={10} />Copied!</> : <><Copy size={10} />Copy URL</>}
                </button>
              </div>
            )}
          </div>

          {/* Upload new QR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '0.7rem', color: '#8A9BB0', letterSpacing: '0.05em' }}>
              {qrUrl ? 'REPLACE QR CODE' : 'UPLOAD QR CODE'}
            </p>

            {qr.file && qr.preview ? (
              <div style={{ background: 'rgba(10,14,26,0.5)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(34,197,94,0.3)', textAlign: 'center' }}>
                <div style={{ width: '140px', height: '140px', margin: '0 auto 12px', borderRadius: '10px', overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={qr.preview} alt="QR Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <p style={{ fontSize: '0.78rem', color: '#F0EDE4', fontWeight: 500, marginBottom: '3px' }}>{qr.file.name}</p>
                <p style={{ fontSize: '0.68rem', color: '#8A9BB0', marginBottom: '12px' }}>{(qr.file.size / 1024).toFixed(0)} KB</p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={uploadQR} disabled={qr.uploading}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px', borderRadius: '10px', background: 'linear-gradient(135deg,#B8860B,#D4AF37)', color: '#000', fontFamily: 'Cinzel,serif', fontSize: '0.75rem', fontWeight: 700, cursor: qr.uploading ? 'not-allowed' : 'pointer', border: 'none' }}>
                    {qr.uploading ? <><span style={{ ...spinStyle, borderColor: '#000', borderTopColor: 'transparent' }} />Uploading…</> : <><Upload size={13} />Upload QR Code</>}
                  </button>
                  <button onClick={qr.reset} style={{ padding: '9px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', fontSize: '0.75rem', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <DropZone allowed={ALLOWED_QR} label="Drag & drop QR code image" hint="PNG · JPG · WebP · Max 5MB"
                onFile={f => qr.handleFile(f, ALLOWED_QR)}
                dragging={qr.dragging} setDragging={qr.setDragging} inputRef={qrInputRef as React.RefObject<HTMLInputElement>} />
            )}

            <AnimatePresence>
              {qr.status === 'success' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={13} /> QR code uploaded! Now live on the payment page.
                </motion.div>
              )}
              {(qr.error || qr.status === 'error') && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={13} /> {qr.error || 'Upload failed.'}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instructions */}
            <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.12)' }}>
              <p style={{ fontSize: '0.72rem', color: '#8A9BB0', lineHeight: 1.6 }}>
                <span style={{ color: '#D4AF37', fontWeight: 600 }}>How it works:</span> Upload your UPI QR code image. Customers will see it on the payment page and can scan it with any UPI app (PhonePe, GPay, Paytm, etc.) to pay instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Payment details fields */}
        <div>
          <div className="luxury-divider" style={{ margin: '4px 0 20px' }} />
          <p style={{ fontSize: '0.72rem', color: '#8A9BB0', marginBottom: '14px', letterSpacing: '0.05em' }}>PAYMENT DETAILS (shown on payment page)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap: '12px' }}>
            {[
              { key: 'upi_id', label: 'UPI ID' },
              { key: 'bank_name', label: 'Bank Name' },
              { key: 'account_name', label: 'Account Holder Name' },
              { key: 'account_no', label: 'Account Number' },
              { key: 'ifsc', label: 'IFSC Code' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#8A9BB0', marginBottom: '6px' }}>{f.label}</label>
                <input type="text" value={settings[f.key] || ''} onChange={e => update(f.key, e.target.value)}
                  style={inp} onFocus={inpFocus} onBlur={inpBlur} />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════
          3. DOMAIN / SITE SETTINGS
      ══════════════════════════════════════════ */}
      <Section icon={<Globe size={16} color="#D4AF37" />} title="DOMAIN & SITE SETTINGS" subtitle="Configure your custom domain, base URL, and site identity">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: '14px' }}>

          {/* Site name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#8A9BB0', marginBottom: '6px' }}>Site Name</label>
            <input type="text" value={settings.site_name || ''} onChange={e => update('site_name', e.target.value)}
              placeholder="Thai Lottery Premium Service" style={inp} onFocus={inpFocus} onBlur={inpBlur} />
            <p style={{ fontSize: '0.65rem', color: '#8A9BB0', marginTop: '4px' }}>Shown in browser tab and header</p>
          </div>

          {/* Custom domain */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#8A9BB0', marginBottom: '6px' }}>
              Custom Domain <span style={{ color: 'rgba(212,175,55,0.5)', fontSize: '0.62rem' }}>(e.g. www.yoursite.com)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.78rem', color: '#8A9BB0' }}>https://</span>
              <input type="text" value={(settings.site_domain || '').replace(/^https?:\/\//, '')}
                onChange={e => update('site_domain', e.target.value.replace(/^https?:\/\//, ''))}
                placeholder="www.yoursite.com"
                style={{ ...inp, paddingLeft: '72px' }} onFocus={inpFocus} onBlur={inpBlur} />
            </div>
            <p style={{ fontSize: '0.65rem', color: '#8A9BB0', marginTop: '4px' }}>Used for SEO, sitemaps, and canonical URLs</p>
          </div>

          {/* Base URL */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#8A9BB0', marginBottom: '6px' }}>
              Base URL <span style={{ color: 'rgba(212,175,55,0.5)', fontSize: '0.62rem' }}>(full URL with https://)</span>
            </label>
            <input type="url" value={settings.site_base_url || ''}
              onChange={e => update('site_base_url', e.target.value)}
              placeholder="https://www.yoursite.com"
              style={inp} onFocus={inpFocus} onBlur={inpBlur} />
            <p style={{ fontSize: '0.65rem', color: '#8A9BB0', marginTop: '4px' }}>Full URL used in WhatsApp share links and meta tags</p>
          </div>
        </div>

        {/* Current domain info card */}
        {(settings.site_domain || settings.site_base_url) && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
            <p style={{ fontSize: '0.72rem', color: '#D4AF37', fontFamily: 'Cinzel,serif', letterSpacing: '0.06em', marginBottom: '10px' }}>CURRENT DOMAIN CONFIG</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {settings.site_domain && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <Globe size={13} color="#8A9BB0" />
                  <span style={{ fontSize: '0.78rem', color: '#F0EDE4', fontFamily: 'monospace' }}>
                    https://{settings.site_domain}
                  </span>
                  <button onClick={() => copyToClipboard(`https://${settings.site_domain}`, 'domain')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(212,175,55,0.1)', border: 'none', color: '#D4AF37', fontSize: '0.65rem', cursor: 'pointer' }}>
                    {copiedKey === 'domain' ? <><CheckCircle size={10} />Copied!</> : <><Copy size={10} />Copy</>}
                  </button>
                </div>
              )}
              {settings.site_base_url && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <LinkIcon size={13} color="#8A9BB0" />
                  <span style={{ fontSize: '0.78rem', color: '#F0EDE4', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {settings.site_base_url}
                  </span>
                  <button onClick={() => copyToClipboard(settings.site_base_url, 'baseurl')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(212,175,55,0.1)', border: 'none', color: '#D4AF37', fontSize: '0.65rem', cursor: 'pointer' }}>
                    {copiedKey === 'baseurl' ? <><CheckCircle size={10} />Copied!</> : <><Copy size={10} />Copy</>}
                  </button>
                </div>
              )}
            </div>
            <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <p style={{ fontSize: '0.7rem', color: '#22C55E', lineHeight: 1.5 }}>
                ✓ Domain saved. WhatsApp share links, SEO meta tags, and canonical URLs will use this domain after saving.
              </p>
            </div>
          </motion.div>
        )}

        {/* Domain setup guide */}
        <div>
          <button onClick={() => setShowDomain(!showDomain)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#D4AF37', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Cinzel,serif' }}>
            {showDomain ? <EyeOff size={13} /> : <Eye size={13} />}
            {showDomain ? 'Hide' : 'Show'} Domain Setup Guide
          </button>
          <AnimatePresence>
            {showDomain && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}>
                <div style={{ marginTop: '12px', padding: '16px', borderRadius: '12px', background: 'rgba(10,14,26,0.6)', border: '1px solid rgba(212,175,55,0.12)' }}>
                  <p style={{ fontSize: '0.75rem', color: '#D4AF37', fontFamily: 'Cinzel,serif', marginBottom: '10px' }}>HOW TO CONNECT YOUR DOMAIN</p>
                  <ol style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      'Purchase a domain from GoDaddy, Namecheap, or any registrar.',
                      'In your Vercel dashboard → Project Settings → Domains → Add your domain.',
                      'Add a CNAME record in your DNS: Name = @ or www, Value = cname.vercel-dns.com',
                      'Wait 24–48 hours for DNS propagation.',
                      'Come back here and enter your domain in the fields above, then click Save.',
                    ].map((step, i) => (
                      <li key={i} style={{ fontSize: '0.78rem', color: '#8A9BB0', lineHeight: 1.6 }}>
                        <span style={{ color: '#D4AF37', fontWeight: 600 }}>Step {i + 1}:</span> {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Section>

      {/* ══════════════════════════════════════════
          4. SITE CONTENT
      ══════════════════════════════════════════ */}
      <Section icon={<span style={{ fontSize: '1rem' }}>✏️</span>} title="SITE CONTENT" subtitle="Hero text and homepage messaging">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: '14px' }}>
          {[
            { key: 'hero_title', label: 'Hero Title', placeholder: 'Win Big. Live Royally.' },
            { key: 'hero_subtitle', label: 'Hero Subtitle', placeholder: "Thailand's most accurate lottery predictions." },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#8A9BB0', marginBottom: '6px' }}>{f.label}</label>
              <input type="text" value={settings[f.key] || ''} onChange={e => update(f.key, e.target.value)}
                placeholder={f.placeholder} style={inp} onFocus={inpFocus} onBlur={inpBlur} />
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════
          5. CONTACT & COMMUNICATION
      ══════════════════════════════════════════ */}
      <Section icon={<span style={{ fontSize: '1rem' }}>📞</span>} title="CONTACT & COMMUNICATION" subtitle="WhatsApp number and email shown across the site">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#8A9BB0', marginBottom: '6px' }}>WhatsApp Number <span style={{ color: 'rgba(212,175,55,0.5)', fontSize: '0.62rem' }}>(country code, no + or spaces)</span></label>
            <input type="text" value={settings.whatsapp_number || ''} onChange={e => update('whatsapp_number', e.target.value.replace(/\D/g, ''))}
              placeholder="919912079906" style={inp} onFocus={inpFocus} onBlur={inpBlur} />
            <p style={{ fontSize: '0.65rem', color: '#8A9BB0', marginTop: '4px' }}>
              Preview: https://wa.me/{settings.whatsapp_number || '919912079906'}
            </p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#8A9BB0', marginBottom: '6px' }}>Contact Email</label>
            <input type="email" value={settings.email || ''} onChange={e => update('email', e.target.value)}
              placeholder="vijaythai456@gmail.com" style={inp} onFocus={inpFocus} onBlur={inpBlur} />
          </div>
        </div>
      </Section>

      {/* ── Bottom Save ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '24px' }}>
        <SaveBtn bottom />
      </div>
    </div>
  );
}
