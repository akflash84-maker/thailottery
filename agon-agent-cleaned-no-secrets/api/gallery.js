import supabase from './_supabase.js';

const TABLE = 'gallery_v2';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // Never cache gallery — admin changes must appear immediately
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { category } = req.query;
      let query = supabase
        .from(TABLE)
        .select('id,title,url,type,category,storage_path,created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (category && category !== 'all') query = query.eq('category', category);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { title, url, type, category, storage_path } = req.body;
      if (!title || !url) return res.status(400).json({ error: 'title and url are required' });
      const { data, error } = await supabase
        .from(TABLE)
        .insert({ title, url, type: type || 'image', category: category || 'results', storage_path: storage_path || null })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { data, error } = await supabase.from(TABLE).update(updates).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { data: item } = await supabase.from(TABLE).select('storage_path').eq('id', id).maybeSingle();
      if (item?.storage_path) {
        supabase.storage.from('media').remove([item.storage_path]).catch(console.error);
      }
      const { error } = await supabase.from(TABLE).delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Gallery API error:', err);
    res.status(500).json({ error: err.message });
  }
}
