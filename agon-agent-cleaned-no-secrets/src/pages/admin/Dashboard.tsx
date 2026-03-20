import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, MessageSquare, Users, CreditCard, TrendingUp, Smartphone, ArrowRight } from 'lucide-react';

interface Stats {
  total_pageviews: number;
  whatsapp_clicks: number;
  form_submissions: number;
  pages: { page: string; count: number }[];
  devices: { device: string; count: number }[];
}
interface Lead    { id: number; name: string; email: string; status: string; created_at: string; }
interface Payment { id: number; name: string; status: string; amount: number; currency: string; plan_name: string; created_at: string; }

const CARD_SPIN = `@keyframes spin{to{transform:rotate(360deg)}}`;

export default function Dashboard() {
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [leads,    setLeads]    = useState<Lead[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/analytics?range=7d&_t=${Date.now()}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }).then(r => r.json()).catch(() => null),
      fetch(`/api/leads?_t=${Date.now()}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }).then(r => r.json()).catch(() => []),
      fetch(`/api/payments?_t=${Date.now()}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }).then(r => r.json()).catch(() => []),
    ]).then(([a, l, p]) => {
      setStats(a);
      setLeads(Array.isArray(l) ? l.slice(0, 6) : []);
      setPayments(Array.isArray(p) ? p.slice(0, 6) : []);
    }).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { icon: Eye,           label: 'Page Views (7d)',  value: stats?.total_pageviews ?? '—',  color: '#3B82F6', bg: 'rgba(59,130,246,0.12)'  },
    { icon: MessageSquare, label: 'WhatsApp Clicks',  value: stats?.whatsapp_clicks ?? '—',  color: '#25D366', bg: 'rgba(37,211,102,0.12)'  },
    { icon: Users,         label: 'Form Submissions', value: stats?.form_submissions ?? '—', color: '#D4AF37', bg: 'rgba(212,175,55,0.12)'  },
    { icon: CreditCard,    label: 'Total Leads',      value: leads.length,                   color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)'  },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '72px 0', flexDirection: 'column', gap: '14px' }}>
      <div style={{ width: 36, height: 36, border: '2px solid #D4AF37', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{CARD_SPIN}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <style>{CARD_SPIN}</style>

      {/* ── KPI cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px' }} className="dash-kpi">
        <style>{`@media(min-width:640px){.dash-kpi{grid-template-columns:repeat(4,1fr)!important}}`}</style>
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ background: 'rgba(19,27,46,0.8)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '18px', padding: 'clamp(14px,2.5vw,22px)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: 38, height: 38, borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: k.bg }}>
                <k.icon size={17} color={k.color} />
              </div>
              <TrendingUp size={13} color="#22C55E" />
            </div>
            <div>
              <div className="font-luxury" style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', color: '#F0EDE4', fontWeight: 700, lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#8A9BB0', marginTop: '5px', lineHeight: 1.3 }}>{k.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: '16px' }}>

        {/* Top pages */}
        <div style={{ background: 'rgba(19,27,46,0.8)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '18px', padding: 'clamp(16px,2.5vw,24px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 className="font-luxury" style={{ fontSize: '0.72rem', color: '#D4AF37', letterSpacing: '0.1em' }}>TOP PAGES</h3>
            <span style={{ fontSize: '0.65rem', color: '#8A9BB0' }}>Last 7 days</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(stats?.pages || []).slice(0, 6).map(p => {
              const max = Math.max(...(stats?.pages || []).map(x => x.count), 1);
              return (
                <div key={p.page}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '5px' }}>
                    <span style={{ color: '#C0C8D8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{p.page || '/'}</span>
                    <span style={{ color: '#F0EDE4', fontWeight: 600, marginLeft: '8px', flexShrink: 0 }}>{p.count}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: '3px', background: 'rgba(212,175,55,0.1)' }}>
                    <div style={{ height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg,#B8860B,#D4AF37)', width: `${(p.count / max) * 100}%`, transition: 'width 0.6s' }} />
                  </div>
                </div>
              );
            })}
            {!stats?.pages?.length && <p style={{ fontSize: '0.75rem', color: '#8A9BB0' }}>No data yet — pages will appear as visitors browse.</p>}
          </div>
        </div>

        {/* Devices */}
        <div style={{ background: 'rgba(19,27,46,0.8)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '18px', padding: 'clamp(16px,2.5vw,24px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 className="font-luxury" style={{ fontSize: '0.72rem', color: '#D4AF37', letterSpacing: '0.1em' }}>DEVICES</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(stats?.devices || []).map(d => {
              const total = (stats?.devices || []).reduce((s, x) => s + x.count, 0) || 1;
              const pct   = Math.round((d.count / total) * 100);
              return (
                <div key={d.device}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <Smartphone size={13} color="#D4AF37" />
                      <span style={{ color: '#C0C8D8', textTransform: 'capitalize' }}>{d.device}</span>
                    </div>
                    <span style={{ color: '#F0EDE4', fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: '3px', background: 'rgba(212,175,55,0.1)' }}>
                    <div style={{ height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg,#B8860B,#D4AF37)', width: `${pct}%`, transition: 'width 0.6s' }} />
                  </div>
                </div>
              );
            })}
            {!stats?.devices?.length && <p style={{ fontSize: '0.75rem', color: '#8A9BB0' }}>No device data yet.</p>}
          </div>
        </div>
      </div>

      {/* ── Recent leads + payments ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: '16px' }}>

        {/* Recent leads */}
        <div style={{ background: 'rgba(19,27,46,0.8)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '18px', padding: 'clamp(16px,2.5vw,24px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 className="font-luxury" style={{ fontSize: '0.72rem', color: '#D4AF37', letterSpacing: '0.1em' }}>RECENT LEADS</h3>
            <Link to="/admin/leads" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: '#8A9BB0', textDecoration: 'none' }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {leads.map(l => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(212,175,55,0.07)' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', color: '#F0EDE4', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#8A9BB0', marginTop: '2px' }}>{new Date(l.created_at).toLocaleDateString()}</div>
                </div>
                <span className={`badge-${l.status}`} style={{ marginLeft: '10px', flexShrink: 0 }}>{l.status}</span>
              </div>
            ))}
            {!leads.length && <p style={{ fontSize: '0.78rem', color: '#8A9BB0', padding: '12px 0' }}>No leads yet.</p>}
          </div>
        </div>

        {/* Recent payments */}
        <div style={{ background: 'rgba(19,27,46,0.8)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '18px', padding: 'clamp(16px,2.5vw,24px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 className="font-luxury" style={{ fontSize: '0.72rem', color: '#D4AF37', letterSpacing: '0.1em' }}>RECENT PAYMENTS</h3>
            <Link to="/admin/payments" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: '#8A9BB0', textDecoration: 'none' }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {payments.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(212,175,55,0.07)' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', color: '#F0EDE4', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#D4AF37', marginTop: '2px' }}>{p.currency} {p.amount} · {p.plan_name}</div>
                </div>
                <span className={`badge-${p.status}`} style={{ marginLeft: '10px', flexShrink: 0 }}>{p.status}</span>
              </div>
            ))}
            {!payments.length && <p style={{ fontSize: '0.78rem', color: '#8A9BB0', padding: '12px 0' }}>No payments yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
