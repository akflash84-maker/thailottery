import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Target, Heart, Globe } from 'lucide-react';
import WhatsAppButton from '../components/WhatsAppButton';
import { trackPageView } from '../lib/analytics';

const values = [
  { icon: Crown,  title: 'Excellence',   desc: 'We maintain the highest standards in every prediction, result, and client interaction.' },
  { icon: Target, title: 'Precision',    desc: 'AI-powered analytics combined with 15+ years of expertise for maximum accuracy.' },
  { icon: Heart,  title: 'Trust',        desc: 'Thousands of verified winners trust us with their lottery journey every month.' },
  { icon: Globe,  title: 'Global Reach', desc: 'Serving premium clients across India, Saudi Arabia, and Kuwait seamlessly.' },
];

const stats = [
  { value: '15+',     label: 'Years Active' },
  { value: '50K+',    label: 'Members' },
  { value: '99.8%',   label: 'Accuracy' },
  { value: '₹500Cr+', label: 'Won by Members' },
];

export default function About() {
  useEffect(() => {
    trackPageView('/about');
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: '#0A0E1A', paddingTop: '64px' }}>

      {/* ── Header ── */}
      <section className="section-pad hero-bg">
        <div className="container container-sm" style={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-luxury" style={{ fontSize: '0.68rem', letterSpacing: '0.15em', color: '#D4AF37', marginBottom: '12px' }}>OUR STORY</p>
            <h1 className="fluid-hero font-luxury" style={{ color: '#F0EDE4', marginBottom: '14px' }}>
              About <span className="text-gold-gradient">Us</span>
            </h1>
            <p style={{ fontSize: 'clamp(0.85rem,2vw,1rem)', color: '#8A9BB0' }}>
              Born from passion, built on precision, trusted by thousands.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="section-pad" style={{ background: '#0D1526' }}>
        <div className="container container-lg">

          {/* Two-column story */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: '48px', alignItems: 'center', marginBottom: '64px' }}>
            <motion.div initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(1.4rem,3vw,2.1rem)', color: '#F0EDE4', marginBottom: '20px', fontWeight: 700, lineHeight: 1.3 }}>
                15 Years of <span className="text-gold-gradient">Winning</span> Excellence
              </h2>
              {[
                'Thai Lottery Premium Service was founded with a singular mission: to give serious lottery enthusiasts access to the most accurate, verified, and timely predictions available anywhere in the world.',
                'Over 15 years, we have built an unrivaled reputation for accuracy and integrity. Our team of expert analysts combines deep statistical modeling with insider knowledge of Thai lottery patterns to deliver predictions that consistently outperform the market.',
                'Today, we proudly serve over 50,000 premium members across India, Saudi Arabia, and Kuwait — each one a testament to our commitment to excellence.',
              ].map((p, i) => (
                <p key={i} style={{ fontSize: '0.875rem', color: '#8A9BB0', lineHeight: 1.85, marginBottom: i < 2 ? '16px' : 0 }}>{p}</p>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.15 }}
              className="glass" style={{ borderRadius: '24px', padding: 'clamp(22px,4vw,36px)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {stats.map(s => (
                  <div key={s.label} style={{ textAlign: 'center', padding: '20px 12px', borderRadius: '16px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.1)' }}>
                    <div className="gold-shimmer font-luxury" style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 700, marginBottom: '6px' }}>{s.value}</div>
                    <div style={{ fontSize: '0.75rem', color: '#8A9BB0' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="luxury-divider" style={{ marginBottom: '56px' }} />

          {/* Values */}
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="fluid-h2 font-luxury" style={{ color: '#F0EDE4' }}>
              Our <span className="text-gold-gradient">Core Values</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: '18px' }}>
            {values.map((v, i) => (
              <motion.div key={v.title} className="glass reveal" style={{ borderRadius: '20px', padding: 'clamp(20px,3vw,28px)', textAlign: 'center', transitionDelay: `${i * 0.1}s` }}
                whileHover={{ y: -6 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', background: 'linear-gradient(135deg,#B8860B,#D4AF37)' }}>
                  <v.icon size={20} color="#000" />
                </div>
                <h3 className="font-luxury" style={{ fontSize: '0.95rem', color: '#F0EDE4', marginBottom: '10px', fontWeight: 700 }}>{v.title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#8A9BB0', lineHeight: 1.7 }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  );
}
