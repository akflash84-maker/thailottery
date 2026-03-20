import { motion } from 'framer-motion';
import WhatsAppButton from '../components/WhatsAppButton';

const sections = [
  { title: 'Information We Collect', content: 'We collect your name, email address, phone number, and payment transaction references when you use our service. We also collect usage data to improve our platform.' },
  { title: 'How We Use Your Information', content: 'Your information is used to provide our services, communicate with you about your account, send lottery predictions, and process payments. We do not sell your data to third parties.' },
  { title: 'Data Security', content: 'We implement bank-level security measures to protect your personal information. All data is encrypted in transit and at rest using industry-standard protocols.' },
  { title: 'WhatsApp Communications', content: 'By providing your phone number, you consent to receive lottery predictions and service updates via WhatsApp. You can opt out at any time by contacting our support team.' },
  { title: 'Data Retention', content: 'We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your data by contacting us.' },
  { title: 'Your Rights', content: 'You have the right to access, correct, or delete your personal information. Contact us at vijaythai456@gmail.com to exercise these rights.' },
  { title: 'Contact Us', content: 'For privacy concerns, contact our Data Protection Officer at vijaythai456@gmail.com or WhatsApp +91 99120 79906.' },
];

export default function Privacy() {
  return (
    <div style={{ background: '#0A0E1A', paddingTop: '64px' }}>
      <section className="section-pad hero-bg">
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-luxury" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#D4AF37', marginBottom: '12px' }}>LEGAL</p>
            <h1 className="fluid-h2 font-luxury" style={{ color: '#F0EDE4' }}>
              Privacy <span className="text-gold-gradient">Policy</span>
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
