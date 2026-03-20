import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { name, email, phone, plan_name, amount, currency, payment_method, transaction_ref } = req.body || {};
      if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
      if (!transaction_ref?.trim()) return res.status(400).json({ error: 'Transaction reference is required' });

      const { data, error } = await supabase
        .from('payments')
        .insert({
          name: name.trim(),
          email: email?.trim() || '',
          phone: phone?.trim() || '',
          plan_name: plan_name || 'Unknown',
          amount: Number(amount) || 0,
          currency: currency || 'INR',
          payment_method: payment_method || 'upi',
          transaction_ref: transaction_ref.trim(),
          status: 'pending',
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status, admin_note } = req.body || {};
      if (!id) return res.status(400).json({ error: 'ID is required' });
      const updateData = {};
      if (status) updateData.status = status;
      if (admin_note !== undefined) updateData.admin_note = admin_note;
      const { data, error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Payments API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
