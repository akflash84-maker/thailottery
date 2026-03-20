import { useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Shield, Trophy, TrendingUp, Users, Award, ChevronRight, Sparkles } from 'lucide-react';
import WhatsAppButton from '../components/WhatsAppButton';
import { trackPageView } from '../lib/analytics';

// Memoized static sections to prevent re-renders
const stats = [
  { value: '15+', label: 'Years Experience' },
  { value: '50K+', label: 'Happy Clients' },
  { value: '99.8%', label: 'Accuracy Rate' },
  { value: '3', label: 'Countries Served' },
];

const features = [
  { icon: Shield, title: 'Verified Results', desc: 'Every result authenticated directly from official Thai Lottery sources with zero manipulation.' },
  { icon: Trophy, title: 'Premium Tips', desc: 'AI-powered analysis combined with expert intuition for maximum winning probability.' },
  { icon: TrendingUp, title: 'Live Updates', desc: 'Real-time lottery results and predictions delivered to your WhatsApp instantly.' },
  { icon: Users, title: 'Dedicated Support', desc: '24/7 personal concierge service for all our premium members.' },
  { icon: Award, title: 'Proven Track Record', desc: 'Thousands of verified winners across India, Saudi Arabia, and Kuwait.' },
  { icon: Star, title: 'Exclusive Access', desc: 'Members-only insider tips and early result notifications before public release.' },
];

const testimonials = [
  { name: 'Rajesh Kumar', location: 'Mumbai, India', text: 'Incredible service! Won ₹8.5 lakhs in my third month. The tips are genuinely accurate.', rating: 5 },
  { name: 'Ahmed Al-Rashidi', location: 'Riyadh, Saudi Arabia', text: 'Best lottery service I have ever used. Professional, reliable, and truly premium.', rating: 5 },
  { name: 'Priya Sharma', location: 'Delhi, India', text: 'Changed my life completely. The team is responsive and the results speak for themselves.', rating: 5 },
];

// Memoized feature card
const FeatureCard = memo(({ f, i }: { f: typeof features[0]; i: number }) => (
  <motion.div
    className="glass reveal"
    style={{ borderRadius: '20px', padding: 'clamp(20px,3vw,32px)', transitionDelay: `${i * 0.08}s` }}
    whileHover={{ y: -6 }}
    transition={{ duration: 0.2 }}
  >
    <div style={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', flexShrink: 0 }}>
      <f.icon size={20} color="#D4AF37" />
    </div>
    <h3 style={{ fontSize: 'clamp(0.95rem,2vw,1.1rem)', fontFamily: 'Playfair Display,Georgia,serif', color: '#F0EDE4', marginBottom: '10px', fontWeight: 600 }}>{f.title}</h3>
    <p style={{ fontSize: '0.83rem', color: '#8A9BB0', lineHeight: 1.7 }}>{f.desc}</p>
  </motion.div>
));

// Memoized testimonial card
const TestimonialCard = memo(({ t, i }: { t: typeof testimonials[0]; i: number }) => (
  <motion.div
    className="glass reveal"
    style={{ borderRadius: '20px', padding: 'clamp(20px,3vw,32px)', transitionDelay: `${i * 0.12}s` }}
    whileHover={{ y: -5 }}
    transition={{ duration: 0.2 }}
  >
    <div style={{ display: 'flex', gap: '3px', marginBottom: '14px' }}>
      {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={13} fill="#D4AF37" color="#D4AF37" />)}
    </div>
    <p style={{ fontSize: '0.85rem', color: '#C0C8D8', lineHeight: 1.75, fontStyle: 'italic', marginBottom: '18px' }}>"{t.text}"</p>
    <div>
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F0EDE4' }}>{t.name}</div>
      <div style={{ fontSize: '0.75rem', color: '#8A9BB0' }}>{t.location}</div>
    </div>
  </motion.div>
));

// Optimized scroll reveal — single shared observer
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target); // Stop observing after reveal
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function Home() {
  useReveal();

  useEffect(() => {
    // Async analytics — don't block render
    requestIdleCallback(() => trackPageView('/'), { timeout: 2000 });
  }, []);

  return (
    <div style={{ background: '#0A0E1A' }}>
      {/* ── Hero ── */}
      <section className="hero-bg" style={{ position: 'relative', minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingTop: '80px', paddingBottom: '60px' }}>
        {/* CSS-only star field — no JS particles */}
        <div className="star-field" />

        {/* Background glow — CSS only */}
        <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle,rgba(212,175,55,.07) 0%,transparent 70%)', top: '5%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', willChange: 'auto' }} />

        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '900px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '20px' }}
          >
            <span className="font-luxury" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '999px', fontSize: 'clamp(0.6rem,1.8vw,0.72rem)', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', letterSpacing: '0.12em' }}>
              <Sparkles size={12} />
              THAILAND'S #1 PREMIUM LOTTERY SERVICE
              <Sparkles size={12} />
            </span>
          </motion.div>

          <motion.h1
            className="fluid-hero font-luxury"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ marginBottom: '20px', letterSpacing: '-0.01em' }}
          >
            <span className="gold-shimmer">Win Big.</span>
            <br />
            <span style={{ color: '#F0EDE4' }}>Live Royally.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: 'clamp(0.9rem,2.5vw,1.1rem)', color: '#8A9BB0', lineHeight: 1.8, marginBottom: '36px', maxWidth: '540px', margin: '0 auto 36px' }}
          >
            Access Thailand's most accurate lottery predictions. Trusted by 50,000+ premium members across India, Saudi Arabia & Kuwait.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '14px' }}
          >
            <Link to="/pricing" className="btn-gold font-luxury"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '999px', fontSize: 'clamp(0.75rem,2vw,0.875rem)', letterSpacing: '0.08em', textDecoration: 'none' }}>
              View Premium Plans <ChevronRight size={16} />
            </Link>
            <WhatsAppButton inline label="WhatsApp Now" />
          </motion.div>

          {/* Stats — staggered reveal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px', marginTop: '56px' }}
            className="stats-grid"
          >
            {stats.map((s) => (
              <div key={s.label} className="glass" style={{ borderRadius: '16px', padding: '18px 12px', textAlign: 'center' }}>
                <div className="gold-shimmer font-luxury" style={{ fontSize: 'clamp(1.4rem,4vw,2rem)', fontWeight: 700, marginBottom: '4px' }}>{s.value}</div>
                <div style={{ fontSize: 'clamp(0.65rem,1.5vw,0.75rem)', color: '#8A9BB0' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
          <style>{`@media(min-width:640px){.stats-grid{grid-template-columns:repeat(4,1fr)!important}}`}</style>
        </div>

        {/* Scroll indicator */}
        <motion.div
          style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)' }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div style={{ width: 24, height: 38, borderRadius: '12px', border: '2px solid rgba(212,175,55,0.35)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '6px' }}>
            <div style={{ width: 3, height: 8, borderRadius: '2px', background: '#D4AF37' }} />
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="section-pad" style={{ background: '#0D1526' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p className="font-luxury" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#D4AF37', marginBottom: '12px' }}>WHY CHOOSE US</p>
            <h2 className="fluid-h2 font-luxury" style={{ color: '#F0EDE4', marginBottom: '14px' }}>
              The <span className="text-gold-gradient">Premium</span> Difference
            </h2>
            <p style={{ fontSize: 'clamp(0.85rem,2vw,1rem)', color: '#8A9BB0', maxWidth: '480px', margin: '0 auto' }}>
              We don't just offer lottery tips. We deliver a complete luxury experience backed by data, expertise, and dedication.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '20px' }}>
            {features.map((f, i) => <FeatureCard key={f.title} f={f} i={i} />)}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section-pad hero-bg">
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p className="font-luxury" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#D4AF37', marginBottom: '12px' }}>SUCCESS STORIES</p>
            <h2 className="fluid-h2 font-luxury" style={{ color: '#F0EDE4' }}>
              Our <span className="text-gold-gradient">Winners</span> Speak
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '20px' }}>
            {testimonials.map((t, i) => <TestimonialCard key={t.name} t={t} i={i} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-pad" style={{ background: '#0D1526' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <div className="glass reveal gold-glow" style={{ borderRadius: '28px', padding: 'clamp(32px,5vw,56px)', textAlign: 'center', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', background: 'linear-gradient(135deg,#B8860B,#D4AF37)' }}>
              <Trophy size={26} color="#000" />
            </div>
            <h2 className="fluid-h2 font-luxury" style={{ color: '#F0EDE4', marginBottom: '14px' }}>
              Ready to <span className="text-gold-gradient">Win?</span>
            </h2>
            <p style={{ fontSize: 'clamp(0.85rem,2vw,1rem)', color: '#8A9BB0', marginBottom: '28px' }}>
              Join thousands of winners. Get your premium membership today.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
              <Link to="/pricing" className="btn-gold font-luxury"
                style={{ display: 'inline-flex', padding: '13px 28px', borderRadius: '999px', fontSize: '0.85rem', letterSpacing: '0.08em', textDecoration: 'none' }}>
                View Plans & Pricing
              </Link>
              <WhatsAppButton inline label="Free Consultation" />
            </div>
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  );
}
