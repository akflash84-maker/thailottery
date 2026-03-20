import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { formatPrice, type Currency } from '../lib/currency';
import { trackPageView } from '../lib/analytics';

interface LocationState {
  plan?: { id: number; name: string; price_inr: number; price_sar: number; price_kwd: number };
  currency?: Currency;
}

// Always fetch fresh settings — no cache
async function loadSettings(): Promise<Record<string, string>> {
  const res = await fetch(`/api/settings?_t=${Date.now()}`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
  });
  if (!res.ok) return {};
  return res.json();
}

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const plan = state?.plan;
  const currency: Currency = (state?.currency as Currency) || 'INR';

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', transaction_ref: '', payment_method: 'upi' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    trackPageView('/payment');
    if (!plan) { navigate('/pricing'); return; }
    loadSettings().then(s => { setSettings(s); setSettingsLoaded(true); });
  }, []);

  const getPrice = () => {
    if (!plan) return 0;
    if (currency === 'SAR') return plan.price_sar;
    if (currency === 'KWD') return plan.price_kwd;
    return plan.price_inr;
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required';
    if (!form.phone.match(/^\+?[\d\s\-]{8,15}$/)) e.phone = 'Valid phone required';
    if (!form.transaction_ref.trim()) e.transaction_ref = 'Transaction reference required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, plan_name: plan?.name, amount: getPrice(), currency }),
      });
      if (res.ok) navigate('/payment-success');
    } finally { setLoading(false); }
  };

  if (!plan) return null;

  // Use settings from DB — always fresh
  const upiId = settings.upi_id || 'vijaythai456@upi';
  const bankName = settings.bank_name || 'HDFC Bank';
  const accountNo = settings.account_no || '50100123456789';
  const ifsc = settings.ifsc || 'HDFC0001234';
  const accountName = settings.account_name || 'Vijay Thai Lottery';
  const qrCodeUrl = settings.qr_code_url || '';

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 13px', borderRadius: '12px',
    background: 'rgba(10,14,26,0.8)', border: '1px solid rgba(212,175,55,0.2)',
    color: '#F0EDE4', fontSize: '0.875rem', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ background: '#0A0E1A', paddingTop: '64px' }}>
      <section className="section-pad hero-bg">
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-luxury" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#D4AF37', marginBottom: '12px' }}>SECURE PAYMENT</p>
            <h1 className="fluid-h2 font-luxury" style={{ color: '#F0EDE4' }}>
              Complete Your <span className="text-gold-gradient">Order</span>
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="section-pad" style={{ background: '#0D1526' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: '28px' }}>

            {/* Left: Order summary + payment methods */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Order summary */}
              <div className="glass" style={{ borderRadius: '20px', padding: 'clamp(18px,3vw,28px)' }}>
                <h3 className="font-luxury" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: '#D4AF37', marginBottom: '16px' }}>ORDER SUMMARY</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#F0EDE4' }}>{plan.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#8A9BB0' }}>{plan.name} Plan</div>
                  </div>
                  <div className="font-luxury" style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', color: '#D4AF37', fontWeight: 700 }}>
                    {formatPrice(getPrice(), currency)}
                  </div>
                </div>
                <div className="luxury-divider" style={{ margin: '16px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#22C55E' }}>
                  <Shield size={13} /> Secure & Encrypted Payment
                </div>
              </div>

              {/* Payment method */}
              <div className="glass" style={{ borderRadius: '20px', padding: 'clamp(18px,3vw,28px)' }}>
                <h3 className="font-luxury" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: '#D4AF37', marginBottom: '16px' }}>PAYMENT METHOD</h3>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  {['upi', 'qr', 'bank'].map(m => (
                    <button key={m} onClick={() => setForm({ ...form, payment_method: m })}
                      style={{
                        flex: 1, padding: '8px 4px', borderRadius: '10px', fontSize: '0.72rem',
                        fontFamily: 'Cinzel,serif', cursor: 'pointer',
                        background: form.payment_method === m ? 'linear-gradient(135deg,#B8860B,#D4AF37)' : 'rgba(212,175,55,0.08)',
                        color: form.payment_method === m ? '#0A0E1A' : '#D4AF37',
                        border: '1px solid rgba(212,175,55,0.3)',
                        fontWeight: form.payment_method === m ? 700 : 400,
                      }}>
                      {m === 'upi' ? 'UPI' : m === 'qr' ? 'QR Code' : 'Bank'}
                    </button>
                  ))}
                </div>

                {/* UPI */}
                {form.payment_method === 'upi' && (
                  <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.1)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#8A9BB0', marginBottom: '6px' }}>UPI ID</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#F0EDE4', wordBreak: 'break-all', fontWeight: 600 }}>{upiId}</span>
                      <button onClick={() => copy(upiId, 'upi')}
                        style={{ background: 'rgba(212,175,55,0.15)', border: 'none', borderRadius: '8px', padding: '7px', cursor: 'pointer', flexShrink: 0, display: 'flex' }}>
                        {copied === 'upi' ? <CheckCircle size={14} color="#22C55E" /> : <Copy size={14} color="#D4AF37" />}
                      </button>
                    </div>
                    <p style={{ fontSize: '0.68rem', color: '#8A9BB0', marginTop: '8px' }}>
                      Open any UPI app → Pay → Enter this UPI ID
                    </p>
                  </div>
                )}

                {/* QR */}
                {form.payment_method === 'qr' && (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    {!settingsLoaded ? (
                      <div style={{ width: 'min(200px,70vw)', height: 'min(200px,70vw)', margin: '0 auto', borderRadius: '12px', background: 'rgba(212,175,55,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 28, height: 28, border: '2px solid #D4AF37', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      </div>
                    ) : qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="Payment QR Code"
                        style={{ width: 'min(220px,70vw)', height: 'min(220px,70vw)', margin: '0 auto', borderRadius: '12px', display: 'block', objectFit: 'contain', background: '#fff', padding: '8px' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div style={{ width: 'min(200px,70vw)', height: 'min(200px,70vw)', margin: '0 auto', borderRadius: '12px', background: 'rgba(212,175,55,0.06)', border: '2px dashed rgba(212,175,55,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <p style={{ fontSize: '0.78rem', color: '#8A9BB0', textAlign: 'center', padding: '0 12px' }}>QR Code coming soon</p>
                        <p style={{ fontSize: '0.68rem', color: '#8A9BB0' }}>Use UPI ID instead</p>
                      </div>
                    )}
                    <p style={{ fontSize: '0.75rem', color: '#8A9BB0', marginTop: '10px' }}>Scan with PhonePe, GPay, Paytm, or any UPI app</p>
                  </div>
                )}

                {/* Bank */}
                {form.payment_method === 'bank' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { label: 'Bank', value: bankName, key: '' },
                      { label: 'Account Name', value: accountName, key: '' },
                      { label: 'Account No.', value: accountNo, key: 'acc' },
                      { label: 'IFSC Code', value: ifsc, key: 'ifsc' },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(212,175,55,0.05)' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#8A9BB0' }}>{item.label}</div>
                          <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#F0EDE4', fontWeight: 600 }}>{item.value}</div>
                        </div>
                        {item.key && (
                          <button onClick={() => copy(item.value, item.key)}
                            style={{ background: 'rgba(212,175,55,0.15)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                            {copied === item.key ? <CheckCircle size={13} color="#22C55E" /> : <Copy size={13} color="#D4AF37" />}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Confirmation form */}
            <form onSubmit={handleSubmit} className="glass" style={{ borderRadius: '20px', padding: 'clamp(18px,3vw,28px)', display: 'flex', flexDirection: 'column', gap: '16px', alignSelf: 'start' }}>
              <div>
                <h3 className="font-luxury" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: '#D4AF37', marginBottom: '6px' }}>CONFIRM PAYMENT</h3>
                <p style={{ fontSize: '0.78rem', color: '#8A9BB0' }}>After completing payment, fill in your details below.</p>
              </div>

              {[
                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
                { key: 'phone', label: 'Phone / WhatsApp', type: 'tel', placeholder: '+91 XXXXX XXXXX' },
                { key: 'transaction_ref', label: 'Transaction ID / UTR Number', type: 'text', placeholder: 'e.g. UTR123456789' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#8A9BB0', marginBottom: '5px' }}>{field.label}</label>
                  <input type={field.type} placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'rgba(212,175,55,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.2)'; e.target.style.boxShadow = 'none'; }}
                  />
                  {errors[field.key] && <p style={{ fontSize: '0.7rem', color: '#EF4444', marginTop: '3px' }}>{errors[field.key]}</p>}
                </div>
              ))}

              <div style={{ padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
                <AlertCircle size={13} color="#EAB308" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '0.72rem', color: '#C0A020', lineHeight: 1.5 }}>
                  Your account will be activated within 2–5 minutes after payment verification by our team.
                </p>
              </div>

              <button type="submit" disabled={loading} className="btn-gold"
                style={{ padding: '14px', borderRadius: '14px', fontFamily: 'Cinzel,serif', fontSize: '0.82rem', letterSpacing: '0.08em', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none' }}>
                {loading
                  ? <><div style={{ width: 18, height: 18, border: '2px solid #0A0E1A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Processing…</>
                  : 'Submit Payment Confirmation'}
              </button>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
