import { useState, useEffect, createContext, useContext } from 'react';

interface SiteSettings {
  site_name: string;
  site_domain: string;
  site_base_url: string;
  whatsapp_number: string;
  email: string;
  hero_title: string;
  hero_subtitle: string;
  qr_code_url: string;
  upi_id: string;
  [key: string]: string;
}

const defaults: SiteSettings = {
  site_name: 'Thai Lottery Premium Service',
  site_domain: '',
  site_base_url: '',
  whatsapp_number: '919912079906',
  email: 'vijaythai456@gmail.com',
  hero_title: 'Win Big. Live Royally.',
  hero_subtitle: "Thailand's most accurate lottery predictions.",
  qr_code_url: '',
  upi_id: 'vijaythai456@upi',
};

export const SiteSettingsContext = createContext<SiteSettings>(defaults);
export const useSiteSettings = () => useContext(SiteSettingsContext);

export const useSiteSettingsState = () => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    // Try to load from localStorage for instant render
    try {
      const cached = localStorage.getItem('site_settings_cache');
      if (cached) return { ...defaults, ...JSON.parse(cached) };
    } catch {}
    return defaults;
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        const merged = { ...defaults, ...data };
        setSettings(merged);
        // Update document title
        if (merged.site_name) {
          document.title = `${merged.site_name} | Win Big. Live Royally.`;
        }
        // Cache for next visit
        try { localStorage.setItem('site_settings_cache', JSON.stringify(merged)); } catch {}
      })
      .catch(() => {});
  }, []);

  // Helper: build WhatsApp link using stored number
  const waLink = (msg?: string) => {
    const num = settings.whatsapp_number || '919912079906';
    const text = msg || 'Hello, I am interested in your Thai Lottery Premium Service. Please provide details.';
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  };

  // Helper: build full URL using base domain
  const siteUrl = (path = '') => {
    const base = settings.site_base_url || settings.site_domain
      ? `https://${settings.site_domain}`
      : '';
    return base ? `${base.replace(/\/$/, '')}${path}` : path;
  };

  return { settings, waLink, siteUrl };
};
