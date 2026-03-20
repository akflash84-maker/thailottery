import { useState, useEffect, createContext, useContext } from 'react';

interface LogoContextType {
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  refreshLogo: () => Promise<void>;
}

export const LogoContext = createContext<LogoContextType>({
  logoUrl: '',
  setLogoUrl: () => {},
  refreshLogo: async () => {},
});

export const useLogo = () => useContext(LogoContext);

export const useLogoState = () => {
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    // Load from localStorage for instant display on mount
    return localStorage.getItem('site_logo_url') || '';
  });

  const refreshLogo = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      const url = data.logo_url || '';
      setLogoUrl(url);
      if (url) localStorage.setItem('site_logo_url', url);
      else localStorage.removeItem('site_logo_url');
    } catch {}
  };

  useEffect(() => {
    refreshLogo();
  }, []);

  const setLogoUrlWithCache = (url: string) => {
    setLogoUrl(url);
    if (url) localStorage.setItem('site_logo_url', url);
    else localStorage.removeItem('site_logo_url');
  };

  return { logoUrl, setLogoUrl: setLogoUrlWithCache, refreshLogo };
};
