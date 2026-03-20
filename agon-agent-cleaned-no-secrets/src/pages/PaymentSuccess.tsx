import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, MessageCircle, Home } from 'lucide-react';

export default function PaymentSuccess() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', paddingTop: '100px' }} className="hero-bg">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        className="glass"
        style={{ borderRadius: '28px', padding: 'clamp(32px,6vw,56px)', textAlign: 'center', maxWidth: '500px', width: '100%', border: '1px solid rgba(212,175,55,0.3)' }}
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          style={{ width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.4)' }}
        >
          <CheckCircle size={40} color="#22C55E" />
        </motion.div>

        <h1 className="font-luxury" style={{ fontSize: 'clamp(1.4rem,4vw,2rem)', color: '#F0EDE4', marginBottom: '14px' }}>
          Payment <span className="text-gold-gradient">Submitted!</span>
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#8A9BB0', lineHeight: 1.8, marginBottom: '32px' }}>
          Thank you! Your payment confirmation has been received. Your account will be activated within 2–5 minutes after payment verification by our team. You'll receive a WhatsApp confirmation shortly.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <a
            href="https://wa.me/919912079906?text=Hello%2C%20I%20have%20completed%20my%20payment.%20Please%20activate%20my%20account."
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', borderRadius: '999px', background: '#25D366', color: '#fff', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', width: '100%', justifyContent: 'center' }}
          >
            <MessageCircle size={18} />
            Confirm on WhatsApp
          </a>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '999px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', textDecoration: 'none', fontSize: '0.875rem', width: '100%', justifyContent: 'center' }}>
            <Home size={16} />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
