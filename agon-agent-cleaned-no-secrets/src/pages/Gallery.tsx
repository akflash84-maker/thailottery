import { useEffect, useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Share2, Play } from 'lucide-react';
import WhatsAppButton from '../components/WhatsAppButton';
import { trackPageView } from '../lib/analytics';


interface GalleryItem { id: number; title: string; url: string; type: string; category: string; }

const categories = ['all', 'results', 'winners', 'proof'];

// Optimized image URL — request smaller sizes from Unsplash
const optimizeUrl = (url: string, w = 600) => {
  if (url.includes('unsplash.com')) {
    return url.replace(/w=\d+/, `w=${w}`).replace(/q=\d+/, 'q=70');
  }
  return url;
};

// Memoized gallery card
const GalleryCard = memo(({ item, onOpen, onShare }: {
  item: GalleryItem;
  onOpen: (item: GalleryItem) => void;
  onShare: (item: GalleryItem, e: React.MouseEvent) => void;
}) => (
  <div
    style={{ breakInside: 'avoid', marginBottom: '14px', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', position: 'relative', border: '1px solid rgba(212,175,55,0.1)', background: '#131B2E' }}
    className="gallery-card"
    onClick={() => onOpen(item)}
  >
    {item.type === 'video' ? (
      <div style={{ position: 'relative', aspectRatio: '16/9' }}>
        <video
          src={item.url}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          muted playsInline preload="none" // Don't preload video — saves bandwidth
          poster="" // No poster fetch either
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(212,175,55,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={18} color="#000" fill="#000" style={{ marginLeft: '3px' }} />
          </div>
        </div>
      </div>
    ) : (
      <img
        src={optimizeUrl(item.url)}
        alt={item.title}
        loading="lazy"
        decoding="async" // Async decode — doesn't block main thread
        style={{ width: '100%', display: 'block', objectFit: 'cover' }}
        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=60'; }}
      />
    )}

    {/* Hover overlay */}
    <div className="gallery-hover" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(10,14,26,.95) 0%,transparent 60%)', opacity: 0, transition: 'opacity 0.25s', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '12px' }}>
      <p style={{ fontSize: '0.78rem', color: '#F0EDE4', marginBottom: '7px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.65rem', textTransform: 'capitalize', background: 'rgba(212,175,55,0.2)', color: '#D4AF37' }}>{item.category}</span>
        <button
          onClick={e => onShare(item, e)}
          style={{ marginLeft: 'auto', width: 26, height: 26, borderRadius: '50%', background: '#25D366', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          aria-label="Share on WhatsApp"
        >
          <Share2 size={11} color="#fff" />
        </button>
      </div>
    </div>

    <div className="gallery-zoom" style={{ position: 'absolute', top: '8px', right: '8px', opacity: 0, transition: 'opacity 0.25s' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(212,175,55,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ZoomIn size={12} color="#000" />
      </div>
    </div>
  </div>
));

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  useEffect(() => {
    requestIdleCallback(() => trackPageView('/gallery'), { timeout: 2000 });
  }, []);

  useEffect(() => {
    setLoading(true);
    const base = activeCategory === 'all' ? '/api/gallery' : `/api/gallery?category=${activeCategory}`;
    const url = `${base}${base.includes('?') ? '&' : '?'}_t=${Date.now()}`;
    fetch(url, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } })
      .then(r => r.json())
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
      { threshold: 0.05 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const handleOpen = useCallback((item: GalleryItem) => setLightbox(item), []);

  const handleShare = useCallback((item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = encodeURIComponent(`Check out this winning proof from Thai Lottery Premium Service! ${item.title} - Join us: https://wa.me/919912079906`);
    window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener,noreferrer');
  }, []);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
  };

  // Close lightbox on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div style={{ background: '#0A0E1A', paddingTop: '64px' }}>
      <section className="section-pad hero-bg">
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="font-luxury" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#D4AF37', marginBottom: '12px' }}>PROOF OF EXCELLENCE</p>
            <h1 className="fluid-hero font-luxury" style={{ color: '#F0EDE4', marginBottom: '14px' }}>
              Winner's <span className="text-gold-gradient">Gallery</span>
            </h1>
            <p style={{ fontSize: 'clamp(0.85rem,2vw,1rem)', color: '#8A9BB0' }}>
              Real results. Real winners. Every image and video is verified and authentic.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-pad" style={{ background: '#0D1526' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          {/* Category filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginBottom: '36px' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => handleCategoryChange(cat)}
                style={{
                  padding: '8px 20px', borderRadius: '999px', fontSize: '0.75rem',
                  fontFamily: 'Cinzel,Georgia,serif', letterSpacing: '0.08em', textTransform: 'capitalize', cursor: 'pointer',
                  background: activeCategory === cat ? 'linear-gradient(135deg,#B8860B,#D4AF37)' : 'rgba(212,175,55,0.08)',
                  color: activeCategory === cat ? '#000' : '#D4AF37',
                  border: '1px solid rgba(212,175,55,0.3)',
                  fontWeight: activeCategory === cat ? 700 : 400,
                  transition: 'all 0.2s',
                }}>
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            /* Skeleton */
            <div style={{ columns: '2', gap: '14px' }} className="gallery-cols">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ breakInside: 'avoid', marginBottom: '14px', borderRadius: '14px', background: 'rgba(212,175,55,0.05)', aspectRatio: i % 2 === 0 ? '4/3' : '3/4', border: '1px solid rgba(212,175,55,0.08)' }} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8A9BB0' }}>
              <p>No gallery items yet. Check back soon!</p>
            </div>
          ) : (
            <div style={{ columns: '1', gap: '14px' }} className="gallery-cols">
              {items.map(item => (
                <GalleryCard key={item.id} item={item} onOpen={handleOpen} onShare={handleShare} />
              ))}
            </div>
          )}

          <style>{`
            @media(min-width:480px){.gallery-cols{columns:2!important}}
            @media(min-width:900px){.gallery-cols{columns:3!important}}
            .gallery-card:hover .gallery-hover{opacity:1!important}
            .gallery-card:hover .gallery-zoom{opacity:1!important}
          `}</style>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              style={{ position: 'relative', maxWidth: 'min(900px,95vw)', width: '100%' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setLightbox(null)}
                style={{ position: 'absolute', top: -14, right: -14, width: 34, height: 34, borderRadius: '50%', background: 'rgba(212,175,55,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
                aria-label="Close">
                <X size={15} color="#000" />
              </button>

              {lightbox.type === 'video' ? (
                <video src={lightbox.url} controls autoPlay style={{ width: '100%', maxHeight: '80vh', borderRadius: '14px', display: 'block' }} />
              ) : (
                <img
                  src={optimizeUrl(lightbox.url, 1200)}
                  alt={lightbox.title}
                  style={{ width: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '14px', display: 'block' }}
                />
              )}
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <p style={{ color: '#F0EDE4', fontSize: '0.875rem', fontWeight: 500 }}>{lightbox.title}</p>
                <span style={{ color: '#D4AF37', fontSize: '0.72rem', textTransform: 'capitalize' }}>{lightbox.category}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <WhatsAppButton />
    </div>
  );
}
