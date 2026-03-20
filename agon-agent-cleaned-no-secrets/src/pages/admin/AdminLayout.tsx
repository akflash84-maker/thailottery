import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Crown, LayoutDashboard, Users, CreditCard, Image,
  Settings, BarChart2, LogOut, Menu, X, MessageSquare,
} from 'lucide-react';

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/leads',     icon: Users,           label: 'Leads' },
  { to: '/admin/payments',  icon: CreditCard,      label: 'Payments' },
  { to: '/admin/gallery',   icon: Image,           label: 'Gallery' },
  { to: '/admin/plans',     icon: MessageSquare,   label: 'Plans' },
  { to: '/admin/analytics', icon: BarChart2,       label: 'Analytics' },
  { to: '/admin/settings',  icon: Settings,        label: 'Settings' },
];

export default function AdminLayout() {
  const [user, setUser]           = useState<{ email: string; role: string } | null>(null);
  const [ready, setReady]         = useState(false);
  const [sideOpen, setSideOpen]   = useState(false);
  const checked                   = useRef(false);
  const location                  = useLocation();
  const navigate                  = useNavigate();

  /* ── Auth check (once per mount) ── */
  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    const token   = localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('admin_user');
    if (!token || !userStr) { navigate('/admin', { replace: true }); return; }

    try {
      setUser(JSON.parse(userStr));
      setReady(true);
    } catch {
      navigate('/admin', { replace: true });
      return;
    }

    // Background verify
    fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', token }),
    }).then(r => {
      if (!r.ok) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        navigate('/admin', { replace: true });
      }
    }).catch(() => { /* keep session on network error */ });
  }, []);

  /* ── Close sidebar on route change ── */
  useEffect(() => { setSideOpen(false); }, [location.pathname]);

  /* ── Lock body scroll when sidebar open on mobile ── */
  useEffect(() => {
    document.body.style.overflow = sideOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sideOpen]);

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin', { replace: true });
  };

  /* ── Loading ── */
  if (!ready) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060910', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: 38, height: 38, border: '2px solid #D4AF37', borderTopColor: 'transparent', borderRadius: '50%', animation: 'adm-spin 0.8s linear infinite' }} />
      <p style={{ color: '#8A9BB0', fontSize: '0.8rem', fontFamily: 'Cinzel,serif' }}>Verifying access…</p>
      <style>{`@keyframes adm-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const activeLabel = NAV.find(n => n.to === location.pathname)?.label || 'Admin';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060910' }}>
      <style>{`
        @keyframes adm-spin { to { transform: rotate(360deg); } }
        @media(min-width:768px){
          .adm-aside  { transform: translateX(0) !important; }
          .adm-main   { margin-left: 230px !important; }
          .adm-burger { display: none !important; }
        }
      `}</style>

      {/* ── Mobile backdrop ── */}
      {sideOpen && (
        <div onClick={() => setSideOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 48 }} />
      )}

      {/* ══════════════════════════════
          SIDEBAR
      ══════════════════════════════ */}
      <aside className="adm-aside" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 230, zIndex: 49,
        display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(180deg,#0A0E1A 0%,#0C1220 100%)',
        borderRight: '1px solid rgba(212,175,55,0.12)',
        transform: sideOpen ? 'translateX(0)' : 'translateX(-230px)',
        transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
        overflowY: 'auto', overflowX: 'hidden',
      }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 18px 18px', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#B8860B,#D4AF37)', flexShrink: 0, boxShadow: '0 0 16px rgba(212,175,55,0.3)' }}>
            <Crown size={15} color="#000" />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#D4AF37', fontFamily: 'Cinzel,serif', fontWeight: 700, letterSpacing: '0.08em', lineHeight: 1.2 }}>ADMIN PANEL</div>
            <div style={{ fontSize: '0.58rem', color: '#8A9BB0', marginTop: '2px' }}>Thai Lottery</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {NAV.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 13px', borderRadius: '11px', textDecoration: 'none',
                background: active ? 'rgba(212,175,55,0.13)' : 'transparent',
                color: active ? '#D4AF37' : '#8A9BB0',
                border: active ? '1px solid rgba(212,175,55,0.28)' : '1px solid transparent',
                fontSize: '0.76rem', fontFamily: 'Cinzel,serif', letterSpacing: '0.04em',
                transition: 'all 0.18s', minHeight: '44px',
                boxShadow: active ? '0 0 12px rgba(212,175,55,0.08)' : 'none',
              }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.06)'; (e.currentTarget as HTMLElement).style.color = '#C8A830'; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#8A9BB0'; } }}
              >
                <item.icon size={15} style={{ flexShrink: 0 }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '10px 10px 16px', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
          <div style={{ padding: '10px 13px', marginBottom: '4px', background: 'rgba(212,175,55,0.04)', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.73rem', color: '#F0EDE4', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            <div style={{ fontSize: '0.62rem', color: '#D4AF37', marginTop: '2px', fontFamily: 'Cinzel,serif' }}>Administrator</div>
          </div>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 13px', borderRadius: '10px', width: '100%',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#EF4444', fontSize: '0.75rem', fontFamily: 'Cinzel,serif',
            minHeight: '44px', transition: 'background 0.18s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════
          MAIN CONTENT
      ══════════════════════════════ */}
      <div className="adm-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>

        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '0 20px', height: '56px', flexShrink: 0,
          background: 'rgba(6,9,16,0.97)',
          borderBottom: '1px solid rgba(212,175,55,0.1)',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Hamburger */}
          <button className="adm-burger" onClick={() => setSideOpen(v => !v)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#D4AF37', display: 'flex', alignItems: 'center', padding: '4px', minHeight: '44px' }}>
            {sideOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Page title */}
          <h1 style={{ fontSize: 'clamp(0.8rem,2vw,0.95rem)', color: '#F0EDE4', fontFamily: 'Cinzel,serif', fontWeight: 600, letterSpacing: '0.06em' }}>
            {activeLabel}
          </h1>

          {/* Live indicator */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
            <span style={{ fontSize: '0.7rem', color: '#8A9BB0' }}>Live</span>
          </div>
        </div>

        {/* Page content */}
        <main style={{ flex: 1, padding: 'clamp(16px,3vw,28px)', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
