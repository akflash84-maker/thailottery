import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      // Handle both JSON and sendBeacon (text/plain) content types
      let body = req.body;
      if (!body || typeof body === 'string') {
        try { body = JSON.parse(body || '{}'); } catch { body = {}; }
      }

      const { event_type, page, device, source, metadata } = body;
      if (!event_type) return res.status(400).json({ error: 'event_type required' });

      // Fire-and-forget insert — return 200 immediately
      supabase.from('analytics').insert({
        event_type,
        page: page || '/',
        device: device || 'unknown',
        source: source || 'direct',
        metadata: metadata || {},
      }).then(({ error }) => {
        if (error) console.error('Analytics insert error:', error.message);
      });

      // Respond immediately — don't wait for DB
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'GET') {
      const { range } = req.query;
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 1;
      const since = new Date(Date.now() - days * 86_400_000).toISOString();

      // Run all queries in parallel
      const [pageviews, whatsapp, forms, devices] = await Promise.all([
        supabase.from('analytics').select('page').eq('event_type', 'pageview').gte('created_at', since).limit(1000),
        supabase.from('analytics').select('id', { count: 'exact', head: true }).eq('event_type', 'whatsapp_click').gte('created_at', since),
        supabase.from('analytics').select('id', { count: 'exact', head: true }).eq('event_type', 'form_submit').gte('created_at', since),
        supabase.from('analytics').select('device').gte('created_at', since).limit(1000),
      ]);

      // Aggregate pages
      const pageMap: Record<string, number> = {};
      (pageviews.data || []).forEach((r: { page: string }) => {
        pageMap[r.page] = (pageMap[r.page] || 0) + 1;
      });

      // Aggregate devices
      const deviceMap: Record<string, number> = {};
      (devices.data || []).forEach((r: { device: string }) => {
        deviceMap[r.device] = (deviceMap[r.device] || 0) + 1;
      });

      // Cache analytics for 60s
      res.setHeader('Cache-Control', 'private, s-maxage=60');
      return res.status(200).json({
        total_pageviews: pageviews.data?.length || 0,
        whatsapp_clicks: whatsapp.count || 0,
        form_submissions: forms.count || 0,
        pages: Object.entries(pageMap)
          .map(([page, count]) => ({ page, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        devices: Object.entries(deviceMap)
          .map(([device, count]) => ({ device, count }))
          .sort((a, b) => b.count - a.count),
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Analytics API error:', err);
    res.status(500).json({ error: err.message });
  }
}
