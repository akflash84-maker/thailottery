import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Upload, X, Image, Video, RefreshCw, CheckCircle, AlertCircle, Plus, Link as LinkIcon } from 'lucide-react';

interface GalleryItem {
  id: number; title: string; url: string; type: string; category: string;
  storage_path: string | null; created_at: string;
}
interface UploadFile {
  id: string; file: File; preview: string; title: string; category: string;
  progress: number; status: 'pending'|'uploading'|'done'|'error'; error?: string;
}

const CATEGORIES = ['results', 'winners', 'proof'];
const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg,video/quicktime';

export default function AdminGallery() {
  const [items, setItems]       = useState<GalleryItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [queue, setQueue]       = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [filter, setFilter]     = useState('all');
  const [showUrlForm, setShowUrlForm] = useState(false);
  const [urlForm, setUrlForm]   = useState({ title: '', url: '', type: 'image', category: 'results' });
  const [urlSaving, setUrlSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef      = useRef<HTMLDivElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    const base = filter === 'all' ? '/api/gallery' : `/api/gallery?category=${filter}`;
    const url = `${base}${filter === 'all' ? '?' : '&'}_t=${Date.now()}`;
    const data = await fetch(url, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }).then(r => r.json());
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };
  useEffect(() => { fetchItems(); }, [filter]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const newItems: UploadFile[] = arr.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: file.type.startsWith('video/') ? '' : URL.createObjectURL(file),
      title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      category: 'results',
      progress: 0,
      status: 'pending',
    }));
    setQueue(prev => [...prev, ...newItems]);
  }, []);

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { if (!dropRef.current?.contains(e.relatedTarget as Node)) setDragging(false); };
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const uploadOne = async (item: UploadFile) => {
    setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'uploading', progress: 10 } : q));
    try {
      const fd = new FormData();
      fd.append('file', item.file);
      fd.append('title', item.title || item.file.name);
      fd.append('category', item.category);

      const interval = setInterval(() => {
        setQueue(prev => prev.map(q => q.id === item.id && q.progress < 85 ? { ...q, progress: q.progress + 10 } : q));
      }, 200);

      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      clearInterval(interval);

      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Upload failed'); }

      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'done', progress: 100 } : q));
      fetchItems();
      setTimeout(() => {
        setQueue(prev => prev.filter(q => q.id !== item.id));
        if (item.preview) URL.revokeObjectURL(item.preview);
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error', progress: 0, error: msg } : q));
    }
  };

  const uploadAll = () => queue.filter(q => q.status === 'pending').forEach(uploadOne);

  const removeFromQueue = (id: string) => {
    setQueue(prev => {
      const item = prev.find(q => q.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter(q => q.id !== id);
    });
  };

  const deleteItem = async (id: number) => {
    setDeleteId(id);
    await fetch('/api/gallery', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setDeleteId(null);
    fetchItems();
  };

  const addByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlForm.url || !urlForm.title) return;
    setUrlSaving(true);
    await fetch('/api/gallery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(urlForm) });
    setUrlForm({ title: '', url: '', type: 'image', category: 'results' });
    setShowUrlForm(false);
    setUrlSaving(false);
    fetchItems();
  };

  const updateQueue = (id: string, field: string, value: string) =>
    setQueue(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));

  const pendingCount = queue.filter(q => q.status === 'pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <h2 className="font-luxury" style={{ fontSize: 'clamp(1rem,2.5vw,1.2rem)', color: '#F0EDE4' }}>Gallery Manager</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={fetchItems} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(212,175,55,.08)', border: '1px solid rgba(212,175,55,.25)', color: '#D4AF37', fontSize: '0.72rem', cursor: 'pointer' }}>
            <RefreshCw size={13} />
          </button>
          <button onClick={() => setShowUrlForm(!showUrlForm)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(212,175,55,.08)', border: '1px solid rgba(212,175,55,.25)', color: '#D4AF37', fontSize: '0.72rem', cursor: 'pointer' }}>
            <LinkIcon size={13} /> URL
          </button>
          <button onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', background: 'linear-gradient(135deg,#B8860B,#D4AF37)', color: '#000', fontSize: '0.72rem', fontFamily: 'Cinzel,serif', fontWeight: 700, cursor: 'pointer', border: 'none' }}>
            <Upload size={13} /> Upload
          </button>
        </div>
        <input ref={fileInputRef} type="file" multiple accept={ACCEPT} style={{ display: 'none' }}
          onChange={e => e.target.files && addFiles(e.target.files)} />
      </div>

      {/* URL form */}
      <AnimatePresence>
        {showUrlForm && (
          <motion.form onSubmit={addByUrl} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ background: 'rgba(19,27,46,.7)', border: '1px solid rgba(212,175,55,.2)', borderRadius: '16px', padding: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '10px', alignItems: 'end' }}>
            {[
              { key: 'title', label: 'Title', type: 'text', placeholder: 'Winner March 2025' },
              { key: 'url',   label: 'URL',   type: 'url',  placeholder: 'https://...' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '0.68rem', color: '#8A9BB0', marginBottom: '4px' }}>{f.label}</label>
                <input type={f.type} value={urlForm[f.key as keyof typeof urlForm]} onChange={e => setUrlForm({ ...urlForm, [f.key]: e.target.value })}
                  placeholder={f.placeholder} required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', background: 'rgba(10,14,26,.8)', border: '1px solid rgba(212,175,55,.2)', color: '#F0EDE4', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', color: '#8A9BB0', marginBottom: '4px' }}>Type</label>
              <select value={urlForm.type} onChange={e => setUrlForm({ ...urlForm, type: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', background: 'rgba(10,14,26,.8)', border: '1px solid rgba(212,175,55,.2)', color: '#F0EDE4', fontSize: '0.8rem', outline: 'none' }}>
                <option value="image">Image</option><option value="video">Video</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', color: '#8A9BB0', marginBottom: '4px' }}>Category</label>
              <select value={urlForm.category} onChange={e => setUrlForm({ ...urlForm, category: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', background: 'rgba(10,14,26,.8)', border: '1px solid rgba(212,175,55,.2)', color: '#F0EDE4', fontSize: '0.8rem', outline: 'none' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={urlSaving} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'linear-gradient(135deg,#B8860B,#D4AF37)', color: '#000', fontFamily: 'Cinzel,serif', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Plus size={12} /> {urlSaving ? '…' : 'Add'}
              </button>
              <button type="button" onClick={() => setShowUrlForm(false)} style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(239,68,68,.1)', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={13} />
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Drop zone */}
      <div ref={dropRef} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#D4AF37' : 'rgba(212,175,55,.22)'}`,
          borderRadius: '18px', padding: 'clamp(24px,4vw,44px) 20px', textAlign: 'center', cursor: 'pointer',
          transition: 'all 0.25s',
          background: dragging ? 'rgba(212,175,55,.06)' : 'rgba(19,27,46,.4)',
          boxShadow: dragging ? '0 0 28px rgba(212,175,55,.15)' : 'none',
        }}>
        <motion.div animate={{ scale: dragging ? 1.07 : 1 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: dragging ? 'rgba(212,175,55,.18)' : 'rgba(212,175,55,.08)', border: `2px solid ${dragging ? '#D4AF37' : 'rgba(212,175,55,.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', transition: 'all 0.25s' }}>
            <Upload size={22} color={dragging ? '#D4AF37' : '#8A9BB0'} />
          </div>
          <p style={{ fontSize: 'clamp(0.85rem,1.8vw,1rem)', color: dragging ? '#D4AF37' : '#F0EDE4', fontWeight: 600, marginBottom: '5px' }}>
            {dragging ? 'Drop files here!' : 'Drag & drop images or videos'}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#8A9BB0' }}>
            or <span style={{ color: '#D4AF37', textDecoration: 'underline' }}>click to browse</span>
          </p>
          <p style={{ fontSize: '0.65rem', color: '#8A9BB0', marginTop: '6px' }}>
            JPG · PNG · GIF · WebP · MP4 · WebM · Max 50MB
          </p>
        </motion.div>
      </div>

      {/* Upload queue */}
      <AnimatePresence>
        {queue.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: 'rgba(19,27,46,.7)', border: '1px solid rgba(212,175,55,.15)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span className="font-luxury" style={{ fontSize: '0.68rem', color: '#D4AF37', letterSpacing: '0.1em' }}>
                QUEUE ({queue.length})
              </span>
              {pendingCount > 0 && (
                <button onClick={uploadAll} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '8px', background: 'linear-gradient(135deg,#B8860B,#D4AF37)', color: '#000', fontFamily: 'Cinzel,serif', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', border: 'none' }}>
                  <Upload size={12} /> Upload All ({pendingCount})
                </button>
              )}
            </div>

            {queue.map(item => (
              <motion.div key={item.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px', borderRadius: '10px', background: 'rgba(10,14,26,.5)', border: '1px solid rgba(212,175,55,.1)', flexWrap: 'wrap' }}>

                {/* Thumb */}
                <div style={{ width: 52, height: 52, borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'rgba(212,175,55,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.file.type.startsWith('video/')
                    ? <Video size={20} color="#D4AF37" />
                    : item.preview
                      ? <img src={item.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Image size={20} color="#D4AF37" />
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                    <input value={item.title} onChange={e => updateQueue(item.id, 'title', e.target.value)}
                      placeholder="Title" disabled={item.status !== 'pending'}
                      style={{ flex: 1, minWidth: '100px', padding: '5px 8px', borderRadius: '6px', background: 'rgba(10,14,26,.7)', border: '1px solid rgba(212,175,55,.15)', color: '#F0EDE4', fontSize: '0.78rem', outline: 'none' }} />
                    <select value={item.category} onChange={e => updateQueue(item.id, 'category', e.target.value)}
                      disabled={item.status !== 'pending'}
                      style={{ padding: '5px 8px', borderRadius: '6px', background: 'rgba(10,14,26,.7)', border: '1px solid rgba(212,175,55,.15)', color: '#D4AF37', fontSize: '0.75rem', outline: 'none' }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', color: '#8A9BB0' }}>
                      {item.file.type.startsWith('video/') ? '🎬' : '🖼️'} {(item.file.size / 1024 / 1024).toFixed(1)}MB
                    </span>
                    {item.status === 'error' && (
                      <span style={{ fontSize: '0.68rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <AlertCircle size={10} /> {item.error}
                      </span>
                    )}
                    {item.status === 'done' && (
                      <span style={{ fontSize: '0.68rem', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle size={10} /> Uploaded!
                      </span>
                    )}
                  </div>

                  {(item.status === 'uploading' || item.status === 'done') && (
                    <div style={{ height: 4, borderRadius: '2px', background: 'rgba(212,175,55,.1)', overflow: 'hidden' }}>
                      <motion.div style={{ height: '100%', borderRadius: '2px', background: item.status === 'done' ? '#22C55E' : 'linear-gradient(90deg,#B8860B,#D4AF37)' }}
                        animate={{ width: `${item.progress}%` }} transition={{ duration: 0.3 }} />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'flex-start' }}>
                  {item.status === 'pending' && (
                    <button onClick={() => uploadOne(item)} style={{ padding: '6px 12px', borderRadius: '7px', background: 'linear-gradient(135deg,#B8860B,#D4AF37)', color: '#000', fontSize: '0.68rem', fontFamily: 'Cinzel,serif', fontWeight: 700, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Upload size={10} /> Upload
                    </button>
                  )}
                  {item.status === 'uploading' && (
                    <div style={{ width: 26, height: 26, border: '2px solid #D4AF37', borderTopColor: 'transparent', borderRadius: '50%' }} className="spin" />
                  )}
                  {(item.status === 'pending' || item.status === 'error') && (
                    <button onClick={() => removeFromQueue(item.id)} style={{ padding: '6px', borderRadius: '7px', background: 'rgba(239,68,68,.1)', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex' }}>
                      <X size={13} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.7rem', color: '#8A9BB0' }}>Filter:</span>
        {['all', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            style={{
              padding: '5px 14px', borderRadius: '999px', fontSize: '0.7rem', fontFamily: 'Cinzel,serif',
              textTransform: 'capitalize', cursor: 'pointer',
              background: filter === cat ? 'linear-gradient(135deg,#B8860B,#D4AF37)' : 'rgba(212,175,55,.08)',
              color: filter === cat ? '#000' : '#D4AF37',
              border: '1px solid rgba(212,175,55,.22)',
              fontWeight: filter === cat ? 700 : 400,
            }}>
            {cat}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: '#8A9BB0' }}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '44px 0' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #D4AF37', borderTopColor: 'transparent', borderRadius: '50%' }} className="spin" />
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '44px 20px', color: '#8A9BB0' }}>
          <Upload size={36} color="rgba(212,175,55,.2)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '0.875rem' }}>No media yet. Drag & drop files above.</p>
        </div>
      ) : (
        <div className="admin-gallery-grid">
          {items.map(item => (
            <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              className="admin-gallery-item"
              style={{ borderRadius: '12px', overflow: 'hidden', position: 'relative', background: '#131B2E', border: '1px solid rgba(212,175,55,.1)', aspectRatio: '1' }}
              whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(212,175,55,.15)' }}>

              {item.type === 'video' ? (
                <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline
                  onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                  onMouseLeave={e => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime = 0; }} />
              ) : (
                <img src={item.url} alt={item.title} loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=60'; }} />
              )}

              {/* Overlay */}
              <div className="admin-gallery-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(10,14,26,.95) 0%,rgba(10,14,26,.2) 60%,transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '10px' }}>
                <p className="text-ellipsis" style={{ fontSize: '0.68rem', color: '#F0EDE4', fontWeight: 500, marginBottom: '6px' }}>{item.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ padding: '1px 7px', borderRadius: '999px', fontSize: '0.58rem', textTransform: 'capitalize', background: 'rgba(212,175,55,.22)', color: '#D4AF37' }}>{item.category}</span>
                  <button onClick={() => deleteItem(item.id)} disabled={deleteId === item.id}
                    style={{ marginLeft: 'auto', width: 24, height: 24, borderRadius: '50%', background: 'rgba(239,68,68,.88)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {deleteId === item.id
                      ? <div style={{ width: 10, height: 10, border: '1.5px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} className="spin" />
                      : <Trash2 size={11} color="#fff" />}
                  </button>
                </div>
              </div>

              {/* Type badge */}
              <div style={{ position: 'absolute', top: '6px', left: '6px' }}>
                <div style={{ padding: '2px 6px', borderRadius: '999px', fontSize: '0.55rem', background: 'rgba(10,14,26,.8)', color: item.type === 'video' ? '#60A5FA' : '#D4AF37' }}>
                  {item.type === 'video' ? '🎬' : '🖼️'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
