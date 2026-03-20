import { useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Star, Zap, MessageSquare } from 'lucide-react';
import WhatsAppButton from '../components/WhatsAppButton';
import { useCurrency } from '../hooks/useCurrency';
import { formatPrice, type Currency } from '../lib/currency';
import { trackPageView } from '../lib/analytics';

interface Plan {
  id: number; name: string; description: string;
  price_inr: number; price_sar: number; price_kwd: number;
  features: string[]; is_popular: boolean; is_active: boolean;
}

const icons = [Star, Zap, Crown];

const PlanCard = memo(({ plan, i, currency, onSelect }: {
  plan: Plan; i: number; currency: string; onSelect: (p: Plan) => void;
}) => {
  const Icon = icons[i % icons.length];
  const price = currency === 'SAR' ? plan.price_sar : currency === 'KWD' ? plan.price_kwd : plan.price_inr;

  return (
    <motion.div className="reveal"
      style={{
        position: 'relative', borderRadius: '24px', padding: 'clamp(24px,4vw,36px)',
        transitionDelay: `${i * 0.1}s`,
        background: plan.is_popular ? 'linear-gradient(135deg,rgba(26,37,64,.95),rgba(19,27,46,.95))' : 'rgba(13,21,38,0.85)',
        border: plan.is_popular ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(212,175,55,0.15)',
        boxShadow: plan.is_popular ? '0 0 40px rgba(212,175,55,0.18)' : 'none',
      }}
      whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>

      {plan.is_popular && (
        <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
          <div className="btn-gold font-luxury" style={{ padding: '5px 18px', borderRadius: '999px', fontSize: '0.65rem', letterSpacing: '0.1em', whiteSpace: 'nowrap', display: 'inline-block' }}>
            MOST POPULAR
          </div>
        </div>
      )}

      <div style={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', background: plan.is_popular ? 'rgba(212,175,55,0.2)' : 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
        <Icon size={20} color="#D4AF37" />
      </div>

      <h3 className="font-luxury" style={{ fontSize: 'clamp(1rem,2.5vw,1.25rem)', color: '#F0EDE4', marginBottom: '8px' }}>{plan.name}</h3>
      <p style={{ fontSize: '0.82rem', color: '#8A9BB0', marginBottom: '20px', lineHeight: 1.6 }}>{plan.description}</p>

      <div style={{ marginBottom: '24px' }}>
        <div className="font-luxury" style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', color: '#D4AF37', fontWeight: 700, lineHeight: 1 }}>
          {formatPrice(price, currency as Currency)}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
        {(Array.isArray(plan.features) ? plan.features : []).map((f: string, j: number) => (
          <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', background: 'rgba(212,175,55,0.15)' }}>
              <Check size={10} color="#D4AF37" />
            </div>
            <span style={{ fontSize: '0.82rem', color: '#C0C8D8', lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>

      <button onClick={() => onSelect(plan)}
        className={plan.is_popular ? 'btn-gold' : 'btn-ghost'}
        style={{ width: '100%', padding: '13px', borderRadius: '14px', fontFamily: 'Cinzel,serif', fontSize: '0.82rem', letterSpacing: '0.08em', border: plan.is_popular ? 'none' : undefined, cursor: 'pointer' }}>
        Select Plan
      </button>
    </motion.div>
  );
});

// Always fetch fresh — no cache
async function fetchPlans(): Promise<Plan[]> {
  const res = await fetch(`/api/plans?_t=${Date.now()}`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
  });
  if (!res.ok) throw new Error('Failed to load plans');
  return res.json();
}

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currency } = useCurrency();
  const navigate = useNavigate();

  const loadPlans = () => {
    setLoading(true);
    setError('');
    fetchPlans()
      .then(data => setPlans(data.filter(p => p.is_active)))
      .catch(() => setError('Failed to load plans. Please refresh.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    trackPageView('/pricing');
    loadPlans();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [plans]);

  const handleSelect = (plan: Plan) => {
    navigate('/payment', { state: { plan, currency } });
  };

  return (
    <div style={{ background: '#0A0E1A', paddingTop: '64px' }}>
      <section className="section-pad hero-bg">
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="font-luxury" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#D4AF37', marginBottom: '12px' }}>INVESTMENT PLANS</p>
            <h1 className="fluid-hero font-luxury" style={{ color: '#F0EDE4', marginBottom: '16px' }}>
              Choose Your <span className="text-gold-gradient">Victory</span>
            </h1>
            <p style={{ fontSize: 'clamp(0.85rem,2vw,1rem)', color: '#8A9BB0' }}>
              Premium plans for serious winners. All plans include dedicated support and verified results.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-pad" style={{ background: '#0D1526' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: '24px' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ borderRadius: '24px', padding: '36px', background: 'rgba(13,21,38,0.8)', border: '1px solid rgba(212,175,55,0.1)', minHeight: '380px', animation: 'pulse 1.5s ease-in-out infinite' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(212,175,55,0.08)', marginBottom: '20px' }} />
                  <div style={{ height: 20, width: '60%', background: 'rgba(212,175,55,0.06)', borderRadius: '8px', marginBottom: '12px' }} />
                  <div style={{ height: 14, width: '80%', background: 'rgba(212,175,55,0.04)', borderRadius: '6px', marginBottom: '24px' }} />
                  <div style={{ height: 40, width: '50%', background: 'rgba(212,175,55,0.08)', borderRadius: '8px', marginBottom: '24px' }} />
                  {[1,2,3].map(j => <div key={j} style={{ height: 12, width: '90%', background: 'rgba(212,175,55,0.04)', borderRadius: '6px', marginBottom: '10px' }} />)}
                </div>
              ))}
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ color: '#EF4444', marginBottom: '16px' }}>{error}</p>
              <button onClick={loadPlans} style={{ padding: '10px 24px', borderRadius: '10px', background: 'linear-gradient(135deg,#B8860B,#D4AF37)', color: '#000', border: 'none', cursor: 'pointer', fontFamily: 'Cinzel,serif', fontSize: '0.82rem' }}>
                Retry
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: '24px', alignItems: 'start' }}>
                {plans.map((plan, i) => <PlanCard key={plan.id} plan={plan} i={i} currency={currency} onSelect={handleSelect} />)}
              </div>
              {plans.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#8A9BB0' }}>
                  No plans available. Please check back soon.
                </div>
              )}
              <div style={{ textAlign: 'center', marginTop: '48px' }} className="reveal">
                <p style={{ fontSize: '0.85rem', color: '#8A9BB0', marginBottom: '16px' }}>Not sure which plan is right for you?</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                  <WhatsAppButton inline label="Get Expert Guidance" />
                  <a href="tel:+919912079906" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', borderRadius: '999px', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>
                    <MessageSquare size={16} /> Call Us
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <WhatsAppButton />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}
