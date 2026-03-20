import { Link } from 'react-router-dom';
import { Crown, Mail, Phone, MapPin } from 'lucide-react';
import WhatsAppButton from './WhatsAppButton';

export default function Footer() {
  return (
    <footer style={{ background: '#060910', borderTop: '1px solid rgba(212,175,55,.1)' }}>
      <div className="container container-xl safe-bottom" style={{ paddingTop: '52px', paddingBottom: '32px' }}>

        <div className="footer-grid" style={{ marginBottom: '44px' }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#B8860B,#D4AF37)', flexShrink: 0 }}>
                <Crown size={16} color="#000" />
              </div>
              <div>
                <div className="font-luxury text-gold-gradient" style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.08em' }}>THAI LOTTERY</div>
                <div style={{ fontSize: '0.52rem', color: '#8A9BB0', letterSpacing: '0.15em' }}>PREMIUM SERVICE</div>
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.75, color: '#8A9BB0', marginBottom: '20px', maxWidth: '300px' }}>
              Thailand's most trusted premium lottery service. Serving clients across India, Saudi Arabia, and Kuwait.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: Phone,  text: '+91 99120 79906' },
                { icon: Mail,   text: 'vijaythai456@gmail.com' },
                { icon: MapPin, text: 'India · Saudi Arabia · Kuwait' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <item.icon size={13} color="#D4AF37" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.78rem', color: '#8A9BB0', wordBreak: 'break-word' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-luxury" style={{ fontSize: '0.68rem', letterSpacing: '0.15em', color: '#D4AF37', marginBottom: '18px' }}>NAVIGATION</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { to: '/',        label: 'Home' },
                { to: '/pricing', label: 'Pricing' },
                { to: '/gallery', label: 'Gallery' },
                { to: '/about',   label: 'About Us' },
                { to: '/faq',     label: 'FAQ' },
                { to: '/contact', label: 'Contact' },
              ].map(l => (
                <Link key={l.to} to={l.to}
                  style={{ fontSize: '0.82rem', color: '#8A9BB0', textDecoration: 'none', transition: 'color 0.2s', display: 'inline', minHeight: 'unset' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#D4AF37')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#8A9BB0')}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal + CTA */}
          <div>
            <h4 className="font-luxury" style={{ fontSize: '0.68rem', letterSpacing: '0.15em', color: '#D4AF37', marginBottom: '18px' }}>LEGAL</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {[
                { to: '/terms',   label: 'Terms of Service' },
                { to: '/privacy', label: 'Privacy Policy' },
              ].map(l => (
                <Link key={l.to} to={l.to}
                  style={{ fontSize: '0.82rem', color: '#8A9BB0', textDecoration: 'none', transition: 'color 0.2s', display: 'inline', minHeight: 'unset' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#D4AF37')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#8A9BB0')}>
                  {l.label}
                </Link>
              ))}
            </div>
            <WhatsAppButton inline label="WhatsApp Us" />
          </div>
        </div>

        <div className="luxury-divider" style={{ marginBottom: '22px' }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <p style={{ fontSize: '0.72rem', color: '#8A9BB0' }}>
            © {new Date().getFullYear()} Thai Lottery Premium Service. All rights reserved.
          </p>
          <p style={{ fontSize: '0.72rem', color: '#8A9BB0' }}>
            Designed with <span style={{ color: '#D4AF37' }}>♦</span> for premium clients
          </p>
        </div>
      </div>
    </footer>
  );
}
