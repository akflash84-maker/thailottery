import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('plans')
        .select('id,name,description,price_inr,price_sar,price_kwd,features,is_popular,is_active,sort_order')
        .order('sort_order', { ascending: true });
      if (error) throw error;

      // NO CDN cache — always fresh so admin changes reflect immediately
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { name, description, price_inr, price_sar, price_kwd, features, is_popular, is_active } = req.body;
      if (!name) return res.status(400).json({ error: 'name is required' });
      const { data, error } = await supabase
        .from('plans')
        .insert({ name, description, price_inr: price_inr || 0, price_sar: price_sar || 0, price_kwd: price_kwd || 0, features: features || [], is_popular: !!is_popular, is_active: is_active !== false, sort_order: 99 })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { data, error } = await supabase.from('plans').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Plans API error:', err);
    res.status(500).json({ error: err.message });
  }
}
