import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0E1A', padding: '20px' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#B8860B,#D4AF37)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Crown size={30} color="#000" />
        </div>
        <div className="gold-shimmer font-luxury" style={{ fontSize: 'clamp(4rem,15vw,7rem)', fontWeight: 900, lineHeight: 1, marginBottom: '16px' }}>404</div>
        <h1 className="font-luxury" style={{ fontSize: 'clamp(1.2rem,3vw,1.6rem)', color: '#F0EDE4', marginBottom: '12px' }}>Page Not Found</h1>
        <p style={{ fontSize: '0.9rem', color: '#8A9BB0', marginBottom: '32px', lineHeight: 1.7 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-gold font-luxury"
          style={{ display: 'inline-flex', padding: '13px 32px', borderRadius: '999px', fontSize: '0.85rem', letterSpacing: '0.08em', textDecoration: 'none' }}>
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
