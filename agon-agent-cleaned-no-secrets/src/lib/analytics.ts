// Non-blocking analytics — uses requestIdleCallback and sendBeacon

const getDevice = (): string => {
  const ua = navigator.userAgent;
  if (/Mobile|Android|iPhone/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
};

const getSource = (): string => {
  try {
    const ref = document.referrer;
    if (!ref) return 'direct';
    if (ref.includes('google')) return 'google';
    if (ref.includes('facebook') || ref.includes('fb.com')) return 'facebook';
    if (ref.includes('whatsapp')) return 'whatsapp';
    return 'referral';
  } catch { return 'direct'; }
};

// Queue events and batch-send during idle time
let eventQueue: Array<{ event_type: string; page: string; metadata?: Record<string, unknown> }> = [];
let flushScheduled = false;

const flushQueue = () => {
  if (!eventQueue.length) return;
  const events = [...eventQueue];
  eventQueue = [];
  flushScheduled = false;

  events.forEach(evt => {
    const payload = JSON.stringify({
      event_type: evt.event_type,
      page: evt.page,
      device: getDevice(),
      source: getSource(),
      metadata: evt.metadata || {},
    });

    // Use sendBeacon for fire-and-forget (doesn't block page)
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics', blob);
    } else {
      // Fallback: fetch with keepalive
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  });
};

export const track = (event_type: string, page: string, metadata?: Record<string, unknown>) => {
  eventQueue.push({ event_type, page, metadata });

  if (!flushScheduled) {
    flushScheduled = true;
    // Use requestIdleCallback to not block main thread
    if ('requestIdleCallback' in window) {
      requestIdleCallback(flushQueue, { timeout: 3000 });
    } else {
      setTimeout(flushQueue, 1000);
    }
  }
};

export const trackPageView   = (page: string) => track('pageview', page);
export const trackWhatsApp   = (page: string) => track('whatsapp_click', page);
export const trackFormSubmit = (page: string) => track('form_submit', page);
export const trackPlanClick  = (page: string, plan: string) => track('plan_click', page, { plan });
