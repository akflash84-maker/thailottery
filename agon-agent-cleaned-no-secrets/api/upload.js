import supabase from './_supabase.js';

// Max file size: 50MB
const MAX_SIZE = 50 * 1024 * 1024;
const ALLOWED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
];

export const config = { api: { bodyParser: false } };

// Read raw body from stream
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Parse multipart form data manually
function parseMultipart(buffer, boundary) {
  const boundaryBuf = Buffer.from('--' + boundary);
  const parts = [];
  let start = 0;

  while (start < buffer.length) {
    const boundaryIdx = buffer.indexOf(boundaryBuf, start);
    if (boundaryIdx === -1) break;

    const headerStart = boundaryIdx + boundaryBuf.length + 2; // skip \r\n
    const headerEnd = buffer.indexOf(Buffer.from('\r\n\r\n'), headerStart);
    if (headerEnd === -1) break;

    const headerStr = buffer.slice(headerStart, headerEnd).toString();
    const contentStart = headerEnd + 4;

    const nextBoundary = buffer.indexOf(boundaryBuf, contentStart);
    if (nextBoundary === -1) break;

    const contentEnd = nextBoundary - 2; // remove trailing \r\n
    const content = buffer.slice(contentStart, contentEnd);

    // Parse headers
    const nameMatch = headerStr.match(/name="([^"]+)"/);
    const filenameMatch = headerStr.match(/filename="([^"]+)"/);
    const contentTypeMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);

    if (nameMatch) {
      parts.push({
        name: nameMatch[1],
        filename: filenameMatch ? filenameMatch[1] : null,
        contentType: contentTypeMatch ? contentTypeMatch[1].trim() : 'text/plain',
        data: content,
      });
    }

    start = nextBoundary;
  }
  return parts;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  // ── DELETE ──
  if (req.method === 'DELETE') {
    try {
      const chunks = [];
      req.on('data', c => chunks.push(c));
      await new Promise(r => req.on('end', r));
      const body = JSON.parse(Buffer.concat(chunks).toString());
      const { path, gallery_id } = body;

      if (path) {
        const { error } = await supabase.storage.from('media').remove([path]);
        if (error) throw error;
      }
      if (gallery_id) {
        await supabase.from('gallery_v2').delete().eq('id', gallery_id);
      }
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST (upload) ──
  if (req.method === 'POST') {
    try {
      // Ensure bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === 'media');
      if (!bucketExists) {
        const { error: bucketErr } = await supabase.storage.createBucket('media', {
          public: true,
          fileSizeLimit: MAX_SIZE,
          allowedMimeTypes: ALLOWED_TYPES,
        });
        if (bucketErr && !bucketErr.message.includes('already exists')) {
          throw bucketErr;
        }
      }

      const contentType = req.headers['content-type'] || '';
      const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);
      if (!boundaryMatch) {
        return res.status(400).json({ error: 'No boundary in multipart form' });
      }
      const boundary = boundaryMatch[1];

      const rawBody = await readBody(req);
      if (rawBody.length > MAX_SIZE) {
        return res.status(413).json({ error: 'File too large. Max size is 50MB.' });
      }

      const parts = parseMultipart(rawBody, boundary);

      // Extract fields
      const filePart = parts.find(p => p.filename);
      const titlePart = parts.find(p => p.name === 'title');
      const categoryPart = parts.find(p => p.name === 'category');

      if (!filePart) return res.status(400).json({ error: 'No file found in upload' });

      const mimeType = filePart.contentType;
      if (!ALLOWED_TYPES.includes(mimeType)) {
        return res.status(400).json({ error: `File type not allowed: ${mimeType}` });
      }

      const isVideo = mimeType.startsWith('video/');
      const ext = filePart.filename.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'jpg');
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const storagePath = `${isVideo ? 'videos' : 'images'}/${safeName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(storagePath, filePart.data, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(storagePath);
      const publicUrl = urlData.publicUrl;

      // Save to gallery_v2 table (has storage_path column)
      const title = titlePart ? titlePart.data.toString().trim() : filePart.filename;
      const category = categoryPart ? categoryPart.data.toString().trim() : 'results';

      const { data: galleryRow, error: dbError } = await supabase
        .from('gallery_v2')
        .insert({
          title,
          url: publicUrl,
          type: isVideo ? 'video' : 'image',
          category,
          storage_path: storagePath,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return res.status(201).json({ ok: true, item: galleryRow });
    } catch (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: err.message || 'Upload failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
