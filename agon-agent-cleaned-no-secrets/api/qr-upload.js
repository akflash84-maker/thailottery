import supabase from './_supabase.js';

export const config = { api: { bodyParser: false } };

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function parseMultipart(buffer, boundary) {
  const boundaryBuf = Buffer.from('--' + boundary);
  const parts = [];
  let start = 0;
  while (start < buffer.length) {
    const bIdx = buffer.indexOf(boundaryBuf, start);
    if (bIdx === -1) break;
    const hStart = bIdx + boundaryBuf.length + 2;
    const hEnd = buffer.indexOf(Buffer.from('\r\n\r\n'), hStart);
    if (hEnd === -1) break;
    const headerStr = buffer.slice(hStart, hEnd).toString();
    const cStart = hEnd + 4;
    const nBoundary = buffer.indexOf(boundaryBuf, cStart);
    if (nBoundary === -1) break;
    const content = buffer.slice(cStart, nBoundary - 2);
    const nameMatch = headerStr.match(/name="([^"]+)"/);
    const filenameMatch = headerStr.match(/filename="([^"]+)"/);
    const ctMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);
    if (nameMatch) parts.push({ name: nameMatch[1], filename: filenameMatch?.[1] || null, contentType: ctMatch?.[1]?.trim() || 'application/octet-stream', data: content });
    start = nBoundary;
  }
  return parts;
}

async function upsertSetting(key, value) {
  const { data } = await supabase.from('settings_v2').select('id').eq('key', key).maybeSingle();
  if (data) await supabase.from('settings_v2').update({ value }).eq('key', key);
  else await supabase.from('settings_v2').insert({ key, value });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'DELETE') {
      const { data: setting } = await supabase.from('settings_v2').select('value').eq('key', 'qr_storage_path').maybeSingle();
      if (setting?.value) await supabase.storage.from('media').remove([setting.value]);
      await upsertSetting('qr_code_url', '');
      await upsertSetting('qr_storage_path', '');
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'POST') {
      const ct = req.headers['content-type'] || '';
      const bm = ct.match(/boundary=([^\s;]+)/);
      if (!bm) return res.status(400).json({ error: 'No boundary' });

      const body = await readBody(req);
      const parts = parseMultipart(body, bm[1]);
      const filePart = parts.find(p => p.filename);
      if (!filePart) return res.status(400).json({ error: 'No file' });

      const allowed = ['image/jpeg','image/jpg','image/png','image/webp','image/gif'];
      if (!allowed.includes(filePart.contentType)) return res.status(400).json({ error: 'Invalid file type' });
      if (filePart.data.length > 5 * 1024 * 1024) return res.status(400).json({ error: 'File too large (max 5MB)' });

      const ext = filePart.filename.split('.').pop()?.toLowerCase() || 'png';
      const path = `qr/payment-qr.${ext}`;

      const { error: upErr } = await supabase.storage.from('media').upload(path, filePart.data, { contentType: filePart.contentType, upsert: true });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
      const url = `${urlData.publicUrl}?t=${Date.now()}`;

      await upsertSetting('qr_code_url', url);
      await upsertSetting('qr_storage_path', path);

      return res.status(200).json({ ok: true, url, path });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('QR upload error:', err);
    return res.status(500).json({ error: err.message });
  }
}
