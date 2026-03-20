import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { XCircle, RefreshCw } from 'lucide-react';

export default function PaymentFailure() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'radial-gradient(ellipse at 30% 40%,rgba(239,68,68,0.06) 0%,transparent 60%),linear-gradient(135deg,#0A0E1A,#0D1526)' }}>
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180 }}
        className="glass"
        style={{ borderRadius: '28px', padding: 'clamp(32px,5vw,56px)', textAlign: 'center', maxWidth: '480px', width: '100%', border: '1px solid rgba(239,68,68,0.2)', boxShadow: '0 0 60px rgba(239,68,68,0.08)' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          style={{ width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.35)' }}
        >
          <XCircle size={40} color="#EF4444" />
        </motion.div>

        <h1 className="font-luxury" style={{ fontSize: 'clamp(1.4rem,4vw,2rem)', color: '#F0EDE4', marginBottom: '14px' }}>
          Payment <span style={{ color: '#EF4444' }}>Issue</span>
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#8A9BB0', lineHeight: 1.75, marginBottom: '32px' }}>
          Something went wrong with your payment. Please try again or contact our support team on WhatsApp for immediate assistance.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a
            href="https://wa.me/919912079906?text=Hello%2C%20I%20had%20an%20issue%20with%20my%20payment.%20Please%20help."
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 24px', borderRadius: '14px', background: '#25D366', color: '#fff', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', boxShadow: '0 0 20px rgba(37,211,102,0.25)' }}
          >
            Get Help on WhatsApp
          </a>
          <Link
            to="/pricing"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 24px', borderRadius: '14px', background: 'linear-gradient(135deg,#B8860B,#D4AF37)', color: '#000', fontFamily: 'Cinzel,serif', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.08em', textDecoration: 'none' }}
          >
            <RefreshCw size={15} />
            Try Again
          </Link>
          <Link
            to="/"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 24px', borderRadius: '14px', background: 'transparent', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', fontFamily: 'Cinzel,serif', fontSize: '0.8rem', letterSpacing: '0.08em', textDecoration: 'none' }}
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
