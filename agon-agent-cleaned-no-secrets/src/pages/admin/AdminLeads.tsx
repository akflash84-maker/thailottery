import { useEffect, useState } from 'react';
import { Trash2, RefreshCw } from 'lucide-react';

interface Lead {
  id: number; name: string; email: string; phone: string;
  message: string; source_page: string; currency: string; status: string; created_at: string;
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    const data = await fetch(`/api/leads?_t=${Date.now()}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }).then(r => r.json()).catch(() => []);
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch('/api/leads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    fetchLeads();
  };

  const deleteLead = async (id: number) => {
    if (!confirm('Delete this lead?')) return;
    await fetch('/api/leads', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchLeads();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 className="font-luxury" style={{ fontSize: 'clamp(1rem,2.5vw,1.2rem)', color: '#F0EDE4' }}>Leads Management</h2>
        <button onClick={fetchLeads} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', fontSize: '0.78rem', cursor: 'pointer' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #D4AF37', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        /* Card view on mobile, table on desktop */
        <>
          {/* Mobile cards */}
          <div className="leads-cards" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leads.map(lead => (
              <div key={lead.id} className="glass" style={{ borderRadius: '14px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F0EDE4' }}>{lead.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#8A9BB0' }}>{lead.email}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span className={`badge-${lead.status}`}>{lead.status}</span>
                    <button onClick={() => deleteLead(lead.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#EF4444', display: 'flex' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.72rem', color: '#8A9BB0', marginBottom: '10px' }}>
                  <span>📞 {lead.phone}</span>
                  <span>🌍 {lead.currency}</span>
                  <span>📄 {lead.source_page}</span>
                  <span>📅 {new Date(lead.created_at).toLocaleDateString()}</span>
                </div>
                <select value={lead.status} onChange={e => updateStatus(lead.id, e.target.value)}
                  style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37', borderRadius: '8px', padding: '6px 10px', fontSize: '0.75rem', cursor: 'pointer', width: '100%' }}>
                  {['new','contacted','converted','closed'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
            {!leads.length && <div style={{ textAlign: 'center', padding: '40px', color: '#8A9BB0' }}>No leads yet</div>}
          </div>

          {/* Desktop table */}
          <div className="leads-table glass" style={{ borderRadius: '16px', overflow: 'hidden', display: 'none' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table-luxury">
                <thead><tr>
                  <th>Name</th><th>Email</th><th>Phone</th>
                  <th>Source</th><th>Currency</th><th>Status</th><th>Date</th><th>Del</th>
                </tr></thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id}>
                      <td style={{ fontWeight: 500 }}>{lead.name}</td>
                      <td style={{ wordBreak: 'break-all' }}>{lead.email}</td>
                      <td>{lead.phone}</td>
                      <td>{lead.source_page}</td>
                      <td>{lead.currency}</td>
                      <td>
                        <select value={lead.status} onChange={e => updateStatus(lead.id, e.target.value)}
                          className={`badge-${lead.status}`} style={{ background: 'transparent', border: 'none', outline: 'none', cursor: 'pointer' }}>
                          {['new','contacted','converted','closed'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => deleteLead(lead.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#EF4444', display: 'flex' }}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!leads.length && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#8A9BB0' }}>No leads yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          <style>{`@media(min-width:900px){.leads-cards{display:none!important}.leads-table{display:block!important}}`}</style>
        </>
      )}
    </div>
  );
}
