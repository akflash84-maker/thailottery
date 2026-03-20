import { motion } from 'framer-motion';
import WhatsAppButton from '../components/WhatsAppButton';

const sections = [
  { title: '1. Acceptance of Terms', content: 'By accessing and using Thai Lottery Premium Service, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.' },
  { title: '2. Service Description', content: 'Thai Lottery Premium Service provides lottery prediction tips, analysis, and information. We do not guarantee winnings and our predictions are for informational purposes only.' },
  { title: '3. Eligibility', content: 'You must be 18 years or older to use our services. By using our service, you confirm that you are of legal age in your jurisdiction.' },
  { title: '4. Payment Terms', content: 'All payments are non-refundable once the service has been activated. Subscription fees must be renewed to continue receiving predictions.' },
  { title: '5. Privacy', content: 'We respect your privacy and protect your personal information. Please review our Privacy Policy for details on how we collect and use your data.' },
  { title: '6. Disclaimer', content: 'Lottery participation involves risk. Past performance does not guarantee future results. Thai Lottery Premium Service is not responsible for any financial losses incurred from lottery participation.' },
  { title: '7. Contact', content: 'For any questions about these terms, please contact us at vijaythai456@gmail.com or via WhatsApp at +91 99120 79906.' },
];

export default function Terms() {
  return (
    <div style={{ background: '#0A0E1A', paddingTop: '64px' }}>
      <section className="section-pad hero-bg">
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-luxury" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#D4AF37', marginBottom: '12px' }}>LEGAL</p>
            <h1 className="fluid-h2 font-luxury" style={{ color: '#F0EDE4' }}>
              Terms of <span className="text-gold-gradient">Service</span>
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="section-pad" style={{ background: '#0D1526' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 20px' }}>
          <div className="glass" style={{ borderRadius: '24px', padding: 'clamp(24px,4vw,40px)', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {sections.map(s => (
              <div key={s.title}>
                <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(1rem,2.5vw,1.15rem)', color: '#D4AF37', marginBottom: '10px', fontWeight: 700 }}>{s.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#8A9BB0', lineHeight: 1.8 }}>{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  );
}
