import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Eye, EyeOff, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (localStorage.getItem('admin_token') && localStorage.getItem('admin_user')) {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    // Load logo
    const cached = localStorage.getItem('site_logo_url');
    if (cached) setLogoUrl(cached);
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.logo_url) setLogoUrl(d.logo_url);
    }).catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: email.trim(), password }),
      });
      let data: { token?: string; user?: { email: string; role: string }; error?: string };
      try { data = await res.json(); } catch { setError('Server error. Please try again.'); return; }

      if (res.ok && data.token && data.user) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError(data.error || 'Login failed. Check your credentials.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 15px', borderRadius: '12px',
    background: 'rgba(10,14,26,0.85)', border: '1px solid rgba(212,175,55,0.2)',
    color: '#F0EDE4', fontSize: '0.9rem', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'radial-gradient(ellipse at 30% 40%,rgba(212,175,55,0.07) 0%,transparent 60%),linear-gradient(135deg,#0A0E1A,#0D1526)' }}>
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ background: 'rgba(19,27,46,0.92)', backdropFilter: 'blur(30px)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '24px', padding: 'clamp(28px,5vw,44px)', boxShadow: '0 0 60px rgba(212,175,55,0.1)' }}>

          {/* Logo / Icon */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            {logoUrl ? (
              <motion.img src={logoUrl} alt="Site Logo"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                style={{ height: '60px', maxWidth: '200px', objectFit: 'contain', margin: '0 auto 16px', display: 'block' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                style={{ width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', background: 'linear-gradient(135deg,#B8860B,#D4AF37)', boxShadow: '0 0 30px rgba(212,175,55,0.4)' }}>
                <Crown size={26} color="#000" />
              </motion.div>
            )}
            <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(1.2rem,3vw,1.5rem)', color: '#F0EDE4', fontWeight: 700, marginBottom: '6px' }}>Admin Portal</h1>
            <p style={{ fontSize: '0.78rem', color: '#8A9BB0' }}>Thai Lottery Premium Service</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#8A9BB0', marginBottom: '7px', letterSpacing: '0.05em' }}>ADMIN EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" autoComplete="email" required style={inp}
                onFocus={e => { e.target.style.borderColor = 'rgba(212,175,55,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.2)'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#8A9BB0', marginBottom: '7px', letterSpacing: '0.05em' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required style={{ ...inp, paddingRight: '44px' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(212,175,55,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(212,175,55,0.2)'; e.target.style.boxShadow = 'none'; }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8A9BB0', display: 'flex', alignItems: 'center', padding: '4px' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: '12px 14px', borderRadius: '10px', fontSize: '0.8rem', color: '#EF4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', lineHeight: 1.4 }}>
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', background: loading ? 'rgba(212,175,55,0.5)' : 'linear-gradient(135deg,#B8860B,#D4AF37,#F5D77A,#D4AF37)', color: '#0A0E1A', fontFamily: 'Cinzel,serif', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.1em', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '48px', boxShadow: loading ? 'none' : '0 0 20px rgba(212,175,55,0.3)' }}>
              {loading ? (
                <><div style={{ width: 18, height: 18, border: '2px solid #0A0E1A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Verifying…</>
              ) : 'Access Admin Panel'}
            </button>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </form>

          <div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent)', margin: '24px 0 16px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Shield size={12} color="#D4AF37" />
            <p style={{ fontSize: '0.7rem', color: '#8A9BB0' }}>Secured & Encrypted Access</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
