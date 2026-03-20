import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import WhatsAppButton from '../components/WhatsAppButton';
import { trackPageView } from '../lib/analytics';

const faqs = [
  { q: 'What is Thai Lottery Premium Service?',        a: "We are Thailand's most trusted lottery prediction service, providing verified tips, real-time results, and expert analysis to help our premium members maximize their winning chances." },
  { q: 'How accurate are your predictions?',           a: 'Our predictions maintain a 99.8% accuracy rate, verified by thousands of winners. We combine AI-powered statistical analysis with 15+ years of expert knowledge.' },
  { q: 'Which countries do you serve?',                a: 'We currently serve premium clients in India (INR), Saudi Arabia (SAR), and Kuwait (KWD). Our multi-currency system ensures seamless transactions for all regions.' },
  { q: 'How do I receive predictions?',                a: 'Predictions are delivered directly to your WhatsApp before each lottery draw. Premium members also get access to our exclusive members portal.' },
  { q: 'What payment methods do you accept?',          a: 'We accept UPI, QR Code payments, and bank transfers. All payment methods are secure and verified by our admin team.' },
  { q: 'Is my information safe?',                      a: 'Absolutely. We use bank-level security to protect all client data. Your personal information is never shared with third parties.' },
  { q: 'Can I upgrade my plan?',                       a: 'Yes! You can upgrade your plan at any time. Contact us on WhatsApp and our team will process the upgrade within 24 hours.' },
  { q: "What if I'm not satisfied?",                   a: "We stand behind our service with a satisfaction guarantee. If you're not happy, contact our support team and we'll work to resolve any issues immediately." },
  { q: 'How often are draws held?',                    a: 'Thai Lottery draws are held twice a month — on the 1st and 16th of every month. We provide predictions before each draw.' },
  { q: 'How do I get started?',                        a: 'Simply choose a plan on our Pricing page, complete the payment, and send us your payment confirmation on WhatsApp. You\'ll be activated within hours.' },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    trackPageView('/faq');
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: '#0A0E1A', paddingTop: '64px' }}>

      {/* Header */}
      <section className="section-pad hero-bg">
        <div className="container container-sm" style={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-luxury" style={{ fontSize: '0.68rem', letterSpacing: '0.15em', color: '#D4AF37', marginBottom: '12px' }}>FREQUENTLY ASKED</p>
            <h1 className="fluid-hero font-luxury" style={{ color: '#F0EDE4', marginBottom: '14px' }}>
              Your <span className="text-gold-gradient">Questions</span> Answered
            </h1>
            <p style={{ fontSize: 'clamp(0.85rem,2vw,1rem)', color: '#8A9BB0' }}>
              Everything you need to know about our premium service.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ list */}
      <section className="section-pad" style={{ background: '#0D1526' }}>
        <div className="container container-md">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {faqs.map((faq, i) => (
              <motion.div key={i} className="glass reveal" style={{ borderRadius: '16px', overflow: 'hidden', transitionDelay: `${i * 0.04}s` }}>
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(14px,2.5vw,20px) clamp(16px,3vw,24px)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '12px' }}
                >
                  <span style={{ fontSize: 'clamp(0.85rem,2vw,0.95rem)', color: '#F0EDE4', fontFamily: 'Playfair Display,serif', fontWeight: 600, lineHeight: 1.4 }}>
                    {faq.q}
                  </span>
                  <motion.div animate={{ rotate: openIdx === i ? 180 : 0 }} transition={{ duration: 0.28 }} style={{ flexShrink: 0 }}>
                    <ChevronDown size={18} color="#D4AF37" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {openIdx === i && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '0 clamp(16px,3vw,24px) clamp(14px,2.5vw,20px)' }}>
                        <div className="luxury-divider" style={{ marginBottom: '14px' }} />
                        <p style={{ fontSize: '0.875rem', color: '#8A9BB0', lineHeight: 1.8 }}>{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }} className="reveal">
            <p style={{ fontSize: '0.875rem', color: '#8A9BB0', marginBottom: '16px' }}>Still have questions?</p>
            <WhatsAppButton inline label="Ask Us on WhatsApp" />
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  );
}
