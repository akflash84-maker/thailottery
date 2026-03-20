import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface Payment {
  id: number; name: string; email: string; phone: string;
  plan_name: string; amount: number; currency: string;
  payment_method: string; transaction_ref: string;
  status: string; admin_note: string; created_at: string;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    const data = await fetch(`/api/payments?_t=${Date.now()}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }).then(r => r.json()).catch(() => []);
    setPayments(data);
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, []);

  const updatePayment = async (id: number, status: string) => {
    await fetch('/api/payments', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    fetchPayments();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 className="font-luxury" style={{ fontSize: 'clamp(1rem,2.5vw,1.2rem)', color: '#F0EDE4' }}>Payment Requests</h2>
        <button onClick={fetchPayments} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', fontSize: '0.78rem', cursor: 'pointer' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #D4AF37', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="pay-cards" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {payments.map(p => (
              <div key={p.id} className="glass" style={{ borderRadius: '14px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F0EDE4' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#8A9BB0' }}>{p.phone}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span className="font-luxury" style={{ fontSize: '0.9rem', color: '#D4AF37', fontWeight: 700 }}>{p.currency} {p.amount}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.72rem', color: '#8A9BB0', marginBottom: '12px' }}>
                  <span>📋 {p.plan_name}</span>
                  <span>💳 {p.payment_method}</span>
                  <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>🔖 {p.transaction_ref}</span>
                  <span>📅 {new Date(p.created_at).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className={`badge-${p.status}`}>{p.status}</span>
                  <button onClick={() => updatePayment(p.id, 'verified')} style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '0.72rem', background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: 'none', cursor: 'pointer' }}>✓ Verify</button>
                  <button onClick={() => updatePayment(p.id, 'rejected')} style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '0.72rem', background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: 'none', cursor: 'pointer' }}>✗ Reject</button>
                </div>
              </div>
            ))}
            {!payments.length && <div style={{ textAlign: 'center', padding: '40px', color: '#8A9BB0' }}>No payments yet</div>}
          </div>

          {/* Desktop table */}
          <div className="pay-table glass" style={{ borderRadius: '16px', overflow: 'hidden', display: 'none' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table-luxury">
                <thead><tr>
                  <th>Client</th><th>Plan</th><th>Amount</th>
                  <th>Method</th><th>Ref / UTR</th><th>Status</th><th>Date</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td><div style={{ fontWeight: 500 }}>{p.name}</div><div style={{ fontSize: '0.7rem', color: '#8A9BB0' }}>{p.phone}</div></td>
                      <td>{p.plan_name}</td>
                      <td style={{ color: '#D4AF37', fontWeight: 600 }}>{p.currency} {p.amount}</td>
                      <td style={{ textTransform: 'capitalize' }}>{p.payment_method}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.transaction_ref}</td>
                      <td><span className={`badge-${p.status}`}>{p.status}</span></td>
                      <td>{new Date(p.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => updatePayment(p.id, 'verified')} style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: 'none', cursor: 'pointer' }}>✓</button>
                          <button onClick={() => updatePayment(p.id, 'rejected')} style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: 'none', cursor: 'pointer' }}>✗</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!payments.length && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#8A9BB0' }}>No payments yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          <style>{`@media(min-width:900px){.pay-cards{display:none!important}.pay-table{display:block!important}}`}</style>
        </>
      )}
    </div>
  );
}
