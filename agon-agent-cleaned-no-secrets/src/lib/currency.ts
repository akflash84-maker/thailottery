export type Currency = 'INR' | 'SAR' | 'KWD';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  SAR: '﷼',
  KWD: 'KD',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  INR: 'Indian Rupee',
  SAR: 'Saudi Riyal',
  KWD: 'Kuwaiti Dinar',
};

export const formatPrice = (amount: number, currency: Currency): string => {
  const symbol = CURRENCY_SYMBOLS[currency];
  if (currency === 'KWD') return `${symbol} ${amount.toFixed(2)}`;
  return `${symbol}${amount.toLocaleString()}`;
};

export const detectCurrency = (): Currency => {
  const stored = localStorage.getItem('preferred_currency') as Currency;
  if (stored && ['INR', 'SAR', 'KWD'].includes(stored)) return stored;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz.includes('Riyadh') || tz.includes('Arabia')) return 'SAR';
  if (tz.includes('Kuwait')) return 'KWD';
  return 'INR';
};
