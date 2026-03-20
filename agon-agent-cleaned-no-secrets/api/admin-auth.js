import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, email, password, token } = req.body || {};

    // ── LOGIN ──
    if (action === 'login') {
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError || !authData?.session) {
        console.error('Auth error:', authError?.message);
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // 2. Check admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('email, role')
        .eq('email', email.trim())
        .maybeSingle();

      if (adminError) {
        console.error('Admin table error:', adminError.message);
        return res.status(500).json({ error: 'Database error. Please try again.' });
      }

      if (!adminData) {
        return res.status(403).json({ error: 'Access denied. This account is not an admin.' });
      }

      return res.status(200).json({
        token: authData.session.access_token,
        user: { email: adminData.email, role: adminData.role },
      });
    }

    // ── VERIFY ──
    if (action === 'verify') {
      if (!token) {
        return res.status(401).json({ error: 'No token provided.' });
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError || !user) {
        return res.status(401).json({ error: 'Token expired or invalid.' });
      }

      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('email, role')
        .eq('email', user.email)
        .maybeSingle();

      if (adminError || !adminData) {
        return res.status(403).json({ error: 'Not an admin.' });
      }

      return res.status(200).json({
        valid: true,
        user: { email: adminData.email, role: adminData.role },
      });
    }

    return res.status(400).json({ error: 'Invalid action. Use "login" or "verify".' });

  } catch (err) {
    console.error('Admin auth error:', err);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
}
