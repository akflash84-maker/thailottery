import { useState, useEffect, createContext, useContext } from 'react';
import { type Currency, detectCurrency } from '../lib/currency';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

export const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'INR',
  setCurrency: () => {},
});

export const useCurrency = () => useContext(CurrencyContext);

export const useCurrencyState = () => {
  const [currency, setCurrencyState] = useState<Currency>('INR');

  useEffect(() => {
    setCurrencyState(detectCurrency());
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('preferred_currency', c);
  };

  return { currency, setCurrency };
};
