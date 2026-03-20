import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import WhatsAppButton from '../components/WhatsAppButton';
import { useCurrency } from '../hooks/useCurrency';
import { trackPageView, trackFormSubmit } from '../lib/analytics';

export default function Contact() {
  const { currency } = useCurrency();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { trackPageView('/contact'); }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())                              e.name    = 'Name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required';
    if (!form.phone.match(/^\+?[\d\s\-]{8,15}$/))      e.phone   = 'Valid phone number required';
    if (form.message.trim().length < 10)               e.message = 'Message must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source_page: 'contact', currency }),
      });
      if (res.ok) {
        setSuccess(true);
        trackFormSubmit('/contact');
        setForm({ name: '', email: '', phone: '', message: '' });
      }
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    padding: '12px 14px', borderRadius: '12px', fontSize: '0.875rem',
  };

  return (
    <div style={{ background: '#0A0E1A', paddingTop: '64px' }}>

      {/* Header */}
      <section className="section-pad hero-bg">
        <div className="container container-sm" style={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-luxury" style={{ fontSize: '0.68rem', letterSpacing: '0.15em', color: '#D4AF37', marginBottom: '12px' }}>GET IN TOUCH</p>
            <h1 className="fluid-hero font-luxury" style={{ color: '#F0EDE4', marginBottom: '14px' }}>
              Contact <span className="text-gold-gradient">Us</span>
            </h1>
            <p style={{ fontSize: 'clamp(0.85rem,2vw,1rem)', color: '#8A9BB0' }}>
              Our premium concierge team is available 24/7 to assist you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="section-pad" style={{ background: '#0D1526' }}>
        <div className="container container-lg">
          <div className="contact-grid">

            {/* Info */}
            <motion.div initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(1.3rem,3vw,1.9rem)', color: '#F0EDE4', marginBottom: '16px', fontWeight: 700 }}>Let's Connect</h2>
              <p style={{ fontSize: '0.875rem', color: '#8A9BB0', lineHeight: 1.8, marginBottom: '32px' }}>
                Whether you're a new client exploring our services or an existing member needing support, our dedicated team is here around the clock.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '32px' }}>
                {[
                  { icon: Phone,  label: 'WhatsApp / Phone', value: '+91 99120 79906' },
                  { icon: Mail,   label: 'Email',            value: 'vijaythai456@gmail.com' },
                  { icon: MapPin, label: 'Serving',          value: 'India · Saudi Arabia · Kuwait' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(212,175,55,.1)', border: '1px solid rgba(212,175,55,.2)' }}>
                      <item.icon size={16} color="#D4AF37" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#8A9BB0', marginBottom: '3px' }}>{item.label}</div>
                      <div style={{ fontSize: '0.875rem', color: '#F0EDE4', fontWeight: 500, wordBreak: 'break-word' }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <WhatsAppButton inline label="Instant WhatsApp Support" />
            </motion.div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
              {success ? (
                <motion.div className="glass" style={{ borderRadius: '24px', padding: 'clamp(28px,5vw,48px)', textAlign: 'center' }}
                  initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <CheckCircle size={52} color="#22C55E" style={{ margin: '0 auto 18px' }} />
                  <h3 className="font-luxury" style={{ fontSize: '1.3rem', color: '#F0EDE4', marginBottom: '12px' }}>Message Sent!</h3>
                  <p style={{ fontSize: '0.875rem', color: '#8A9BB0', marginBottom: '24px' }}>
                    Thank you! Our team will contact you within 24 hours.
                  </p>
                  <button onClick={() => setSuccess(false)} className="btn-ghost"
                    style={{ padding: '10px 24px', borderRadius: '999px', fontSize: '0.82rem' }}>
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="glass"
                  style={{ borderRadius: '24px', padding: 'clamp(22px,4vw,36px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 className="font-luxury" style={{ fontSize: '1.05rem', color: '#F0EDE4' }}>Send a Message</h3>

                  {[
                    { key: 'name',    label: 'Full Name',       type: 'text',  placeholder: 'Your full name' },
                    { key: 'email',   label: 'Email Address',   type: 'email', placeholder: 'your@email.com' },
                    { key: 'phone',   label: 'Phone Number',    type: 'tel',   placeholder: '+91 XXXXX XXXXX' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: '#8A9BB0', marginBottom: '6px' }}>{field.label}</label>
                      <input type={field.type} placeholder={field.placeholder}
                        value={form[field.key as keyof typeof form]}
                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                        className="input-luxury" style={inputStyle} />
                      {errors[field.key] && <p style={{ fontSize: '0.7rem', color: '#EF4444', marginTop: '4px' }}>{errors[field.key]}</p>}
                    </div>
                  ))}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#8A9BB0', marginBottom: '6px' }}>Message</label>
                    <textarea rows={4} placeholder="Tell us how we can help you..."
                      value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                      className="input-luxury" style={{ ...inputStyle, resize: 'vertical' }} />
                    {errors.message && <p style={{ fontSize: '0.7rem', color: '#EF4444', marginTop: '4px' }}>{errors.message}</p>}
                  </div>

                  <button type="submit" disabled={loading} className="btn-gold"
                    style={{ padding: '14px', borderRadius: '14px', fontFamily: 'Cinzel,serif', fontSize: '0.82rem', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none' }}>
                    {loading
                      ? <div style={{ width: 20, height: 20, border: '2px solid #0A0E1A', borderTopColor: 'transparent', borderRadius: '50%' }} className="spin" />
                      : <><Send size={15} /> Send Message</>}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  );
}
