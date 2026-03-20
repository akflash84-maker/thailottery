import { useEffect, useState, useRef } from 'react';
import { Eye, MessageSquare, Users, Smartphone, TrendingUp, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface Stats {
  total_pageviews: number;
  whatsapp_clicks: number;
  form_submissions: number;
  pages: { page: string; count: number }[];
  devices: { device: string; count: number }[];
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [range, setRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStats = async () => {
    try {
      const data = await fetch(`/api/analytics?range=${range}`).then(r => r.json());
      setStats(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchStats();
    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(fetchStats, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [range]);

  const conversionRate = stats && stats.total_pageviews > 0
    ? ((stats.form_submissions / stats.total_pageviews) * 100).toFixed(1)
    : '0.0';

  const waClickRate = stats && stats.total_pageviews > 0
    ? ((stats.whatsapp_clicks / stats.total_pageviews) * 100).toFixed(1)
    : '0.0';

  const kpis = [
    { icon: Eye, label: 'Page Views', value: stats?.total_pageviews ?? 0, color: '#3B82F6', sub: `${range} period` },
    { icon: MessageSquare, label: 'WhatsApp Clicks', value: stats?.whatsapp_clicks ?? 0, color: '#25D366', sub: `${waClickRate}% click rate` },
    { icon: Users, label: 'Form Submissions', value: stats?.form_submissions ?? 0, color: '#D4AF37', sub: `${conversionRate}% conversion` },
    { icon: TrendingUp, label: 'Conversion Rate', value: `${conversionRate}%`, color: '#8B5CF6', sub: 'forms / pageviews' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 className="font-luxury" style={{ fontSize: 'clamp(1rem,2.5vw,1.2rem)', color: '#F0EDE4' }}>Analytics Dashboard</h2>
          <p style={{ fontSize: '0.72rem', color: '#8A9BB0', marginTop: '3px' }}>Auto-refreshes every 30 seconds</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['1d', '7d', '30d'].map(r => (
            <button key={r} onClick={() => setRange(r)}
              style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '0.75rem', fontFamily: 'Cinzel,serif', cursor: 'pointer', background: range === r ? 'linear-gradient(135deg,#B8860B,#D4AF37)' : 'rgba(212,175,55,0.08)', color: range === r ? '#000' : '#D4AF37', border: '1px solid rgba(212,175,55,0.25)', fontWeight: range === r ? 700 : 400 }}>
              {r === '1d' ? 'Today' : r === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
          <button onClick={fetchStats} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', fontSize: '0.75rem', cursor: 'pointer' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ width: 36, height: 36, border: '2px solid #D4AF37', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px' }} className="analytics-kpi">
            <style>{`@media(min-width:640px){.analytics-kpi{grid-template-columns:repeat(4,1fr)!important}}`}</style>
            {kpis.map((card, i) => (
              <motion.div key={card.label} className="glass" style={{ borderRadius: '16px', padding: 'clamp(14px,2vw,22px)' }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${card.color}20` }}>
                    <card.icon size={16} color={card.color} />
                  </div>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                </div>
                <div className="font-luxury" style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', color: '#F0EDE4', fontWeight: 700, marginBottom: '4px', lineHeight: 1 }}>{card.value}</div>
                <div style={{ fontSize: '0.72rem', color: '#8A9BB0' }}>{card.label}</div>
                <div style={{ fontSize: '0.65rem', color: card.color, marginTop: '4px', opacity: 0.8 }}>{card.sub}</div>
              </motion.div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: '16px' }}>
            {/* Top pages */}
            <div className="glass" style={{ borderRadius: '16px', padding: 'clamp(16px,2vw,24px)' }}>
              <h3 className="font-luxury" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#D4AF37', marginBottom: '18px' }}>TOP PAGES</h3>
              {(stats?.pages?.length ?? 0) === 0 ? (
                <p style={{ fontSize: '0.78rem', color: '#8A9BB0' }}>No page data for this period. Visit pages to generate analytics.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(stats?.pages || []).slice(0, 8).map((p, i) => {
                    const max = Math.max(...(stats?.pages || []).map(x => x.count), 1);
                    const pct = (p.count / max) * 100;
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '0.78rem', color: '#8A9BB0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{p.page || '/'}</span>
                          <span style={{ fontSize: '0.78rem', color: '#F0EDE4', fontWeight: 500, marginLeft: '8px', flexShrink: 0 }}>{p.count}</span>
                        </div>
                        <div style={{ height: 5, borderRadius: '3px', background: 'rgba(212,175,55,0.1)' }}>
                          <motion.div style={{ height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg,#B8860B,#D4AF37)' }}
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Devices */}
            <div className="glass" style={{ borderRadius: '16px', padding: 'clamp(16px,2vw,24px)' }}>
              <h3 className="font-luxury" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#D4AF37', marginBottom: '18px' }}>DEVICE BREAKDOWN</h3>
              {(stats?.devices?.length ?? 0) === 0 ? (
                <p style={{ fontSize: '0.78rem', color: '#8A9BB0' }}>No device data for this period.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {(stats?.devices || []).map((d, i) => {
                    const total = (stats?.devices || []).reduce((s, x) => s + x.count, 0);
                    const pct = total > 0 ? ((d.count / total) * 100) : 0;
                    const color = d.device === 'mobile' ? '#25D366' : d.device === 'tablet' ? '#3B82F6' : '#D4AF37';
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Smartphone size={13} color={color} />
                            <span style={{ fontSize: '0.78rem', color: '#8A9BB0', textTransform: 'capitalize' }}>{d.device}</span>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#F0EDE4', fontWeight: 500 }}>{pct.toFixed(0)}% ({d.count})</span>
                        </div>
                        <div style={{ height: 5, borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>
                          <motion.div style={{ height: '100%', borderRadius: '3px', background: color }}
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: i * 0.1 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Summary card */}
          <div className="glass" style={{ borderRadius: '16px', padding: 'clamp(16px,2vw,24px)' }}>
            <h3 className="font-luxury" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: '#D4AF37', marginBottom: '16px' }}>PERFORMANCE SUMMARY</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: '14px' }}>
              {[
                { label: 'WhatsApp Click Rate', value: `${waClickRate}%`, desc: 'of visitors clicked WhatsApp', color: '#25D366' },
                { label: 'Form Conversion Rate', value: `${conversionRate}%`, desc: 'of visitors submitted a form', color: '#D4AF37' },
                { label: 'Total Events', value: (stats?.total_pageviews ?? 0) + (stats?.whatsapp_clicks ?? 0) + (stats?.form_submissions ?? 0), desc: 'total tracked interactions', color: '#3B82F6' },
              ].map(item => (
                <div key={item.label} style={{ padding: '14px', borderRadius: '12px', background: 'rgba(10,14,26,0.5)', border: '1px solid rgba(212,175,55,0.08)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#8A9BB0', marginBottom: '6px' }}>{item.label}</div>
                  <div style={{ fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 700, color: item.color, fontFamily: 'Cinzel,serif', marginBottom: '4px' }}>{item.value}</div>
                  <div style={{ fontSize: '0.68rem', color: '#8A9BB0' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
