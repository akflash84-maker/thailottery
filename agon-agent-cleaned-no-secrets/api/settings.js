import supabase from './_supabase.js';

const TABLE = 'settings_v2';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from(TABLE).select('key,value');
      if (error) throw error;
      const map = {};
      (data || []).forEach(r => { map[r.key] = r.value || ''; });
      return res.status(200).json(map);
    }

    if (req.method === 'PUT') {
      const updates = req.body;
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ error: 'Invalid body' });
      }

      const errors = [];

      for (const [key, value] of Object.entries(updates)) {
        const strVal = String(value != null ? value : '');
        const { data: existing } = await supabase
          .from(TABLE).select('id').eq('key', key).maybeSingle();

        if (existing && existing.id) {
          const { error } = await supabase
            .from(TABLE)
            .update({ value: strVal, updated_at: new Date().toISOString() })
            .eq('key', key);
          if (error) errors.push(key + ': ' + error.message);
        } else {
          const { error } = await supabase
            .from(TABLE)
            .insert({ key, value: strVal });
          if (error) errors.push(key + ': ' + error.message);
        }
      }

      if (errors.length) return res.status(500).json({ error: errors.join('; ') });
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Settings API error:', err);
    res.status(500).json({ error: err.message });
  }
}
