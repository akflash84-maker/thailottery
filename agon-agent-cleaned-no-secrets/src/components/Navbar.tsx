import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Crown } from 'lucide-react';
import CurrencySelector from './CurrencySelector';
import { useLogo } from '../hooks/useLogo';

const links = [
  { to: '/', label: 'Home' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { logoUrl } = useLogo();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-strong' : 'bg-transparent'}`}
        style={{ borderBottom: scrolled ? '1px solid rgba(212,175,55,0.15)' : 'none' }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" style={{ height: '36px', maxWidth: '120px', objectFit: 'contain' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#B8860B,#D4AF37)', flexShrink: 0 }}>
                  <Crown size={16} color="#000" />
                </div>
              )}
              <div style={{ lineHeight: 1 }}>
                <div className="font-luxury text-gold-gradient" style={{ fontSize: 'clamp(0.65rem,2.2vw,0.82rem)', fontWeight: 700, letterSpacing: '0.08em' }}>THAI LOTTERY</div>
                <div style={{ fontSize: '0.52rem', color: '#8A9BB0', letterSpacing: '0.15em' }}>PREMIUM SERVICE</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <div style={{ display: 'none', alignItems: 'center', gap: '28px' }} className="md-nav">
              {links.map(l => (
                <Link key={l.to} to={l.to} className="nav-link font-luxury"
                  style={{ color: location.pathname === l.to ? '#D4AF37' : undefined }}>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CurrencySelector />
              <Link to="/pricing" className="btn-gold font-luxury"
                style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '0.7rem', letterSpacing: '0.08em', display: 'none', fontFamily: 'Cinzel,serif', textDecoration: 'none' }}
                id="nav-cta">
                Get Started
              </Link>
              <button
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: '#D4AF37', display: 'flex', alignItems: 'center', minHeight: '44px', minWidth: '44px', justifyContent: 'center' }}
                id="hamburger"
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <style>{`
        @media(min-width:768px){
          .md-nav{display:flex!important}
          #nav-cta{display:inline-flex!important}
          #hamburger{display:none!important}
        }
      `}</style>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 39 }}
              onClick={() => setOpen(false)} />
            <motion.div key="drawer"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(300px,85vw)', zIndex: 40, display: 'flex', flexDirection: 'column', padding: '72px 28px 32px', background: '#0A0E1A', borderLeft: '1px solid rgba(212,175,55,0.15)' }}>
              <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#D4AF37', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36 }}>
                <X size={20} />
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                {links.map((l, i) => (
                  <motion.div key={l.to} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <Link to={l.to} style={{ display: 'block', padding: '13px 16px', borderRadius: '12px', textDecoration: 'none', fontFamily: 'Cinzel,serif', fontSize: '0.9rem', letterSpacing: '0.08em', color: location.pathname === l.to ? '#D4AF37' : '#F0EDE4', background: location.pathname === l.to ? 'rgba(212,175,55,0.08)' : 'transparent' }}>
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <Link to="/pricing" className="btn-gold" style={{ display: 'block', textAlign: 'center', padding: '14px', borderRadius: '14px', fontFamily: 'Cinzel,serif', fontSize: '0.85rem', letterSpacing: '0.1em', textDecoration: 'none', marginTop: '20px' }}>
                Get Started
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
