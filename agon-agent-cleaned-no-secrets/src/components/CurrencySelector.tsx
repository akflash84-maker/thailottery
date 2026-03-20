import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';
import { CURRENCY_SYMBOLS, type Currency } from '../lib/currency';

interface Props { compact?: boolean; }

export default function CurrencySelector({ compact }: Props) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const currencies: Currency[] = ['INR', 'SAR', 'KWD'];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '6px 10px', borderRadius: '8px',
          background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)',
          color: '#D4AF37', fontSize: '0.75rem', fontFamily: 'Cinzel,serif',
          cursor: 'pointer', transition: 'all 0.2s',
          // Do NOT use min-height here — it breaks navbar height
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.15)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.08)')}
      >
        <span>{CURRENCY_SYMBOLS[currency]}</span>
        {!compact && <span>{currency}</span>}
        <ChevronDown size={11} />
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 20,
            background: 'rgba(13,21,38,0.97)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px',
            overflow: 'hidden', minWidth: '110px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            {currencies.map(c => (
              <button key={c} onClick={() => { setCurrency(c); setOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px', background: c === currency ? 'rgba(212,175,55,0.1)' : 'transparent',
                  border: 'none', cursor: 'pointer', color: c === currency ? '#D4AF37' : '#F0EDE4',
                  fontSize: '0.78rem', fontFamily: 'Cinzel,serif', transition: 'background 0.15s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (c !== currency) e.currentTarget.style.background = 'rgba(212,175,55,0.06)'; }}
                onMouseLeave={e => { if (c !== currency) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ color: '#D4AF37', fontSize: '0.9rem' }}>{CURRENCY_SYMBOLS[c]}</span>
                <span>{c}</span>
                {c === currency && <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: '#D4AF37' }}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
