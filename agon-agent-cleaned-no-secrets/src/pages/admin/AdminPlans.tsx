import { useEffect, useState } from 'react';
import { Trash2, Plus, Edit2, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface Plan {
  id: number; name: string; description: string;
  price_inr: number; price_sar: number; price_kwd: number;
  features: string[]; is_popular: boolean; is_active: boolean; sort_order: number;
}

const emptyPlan = { name: '', description: '', price_inr: 0, price_sar: 0, price_kwd: 0, features: [''], is_popular: false, is_active: true };

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyPlan);
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await fetch(`/api/plans?_t=${Date.now()}`, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }).then(r => r.json());
      setPlans(Array.isArray(data) ? data : []);
    } catch { setPlans([]); }
    setLoading(false);
  };
  useEffect(() => { fetchPlans(); }, []);

  const savePlan = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, features: form.features.filter(f => f.trim()) };
    if (editId) await fetch('/api/plans', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editId, ...payload }) });
    else await fetch('/api/plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setForm(emptyPlan); setShowAdd(false); setEditId(null); setSaving(false); fetchPlans();
  };

  const deletePlan = async (id: number) => {
    if (!confirm('Delete this plan?')) return;
    await fetch('/api/plans', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchPlans();
  };

  const startEdit = (plan: Plan) => {
    setForm({ name: plan.name, description: plan.description, price_inr: plan.price_inr, price_sar: plan.price_sar, price_kwd: plan.price_kwd, features: plan.features || [''], is_popular: plan.is_popular, is_active: plan.is_active });
    setEditId(plan.id); setShowAdd(true);
  };

  const inp = { padding: '9px 12px', borderRadius: '10px', fontSize: '0.82rem' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 className="font-luxury" style={{ fontSize: 'clamp(1rem,2.5vw,1.2rem)', color: '#F0EDE4' }}>Plans Manager</h2>
        <button onClick={() => { setShowAdd(!showAdd); setEditId(null); setForm(emptyPlan); }}
          className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', fontSize: '0.78rem', fontFamily: 'Cinzel,serif', cursor: 'pointer', border: 'none' }}>
          <Plus size={13} /> New Plan
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ borderRadius: '16px', padding: 'clamp(16px,3vw,24px)', marginBottom: '20px' }}>
          <h3 className="font-luxury" style={{ fontSize: '0.82rem', color: '#D4AF37', marginBottom: '16px' }}>{editId ? 'Edit Plan' : 'Add New Plan'}</h3>
          <form onSubmit={savePlan} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px' }}>
              {[
                { key: 'name', label: 'Plan Name', type: 'text' },
                { key: 'description', label: 'Description', type: 'text' },
                { key: 'price_inr', label: 'Price INR (₹)', type: 'number' },
                { key: 'price_sar', label: 'Price SAR (﷼)', type: 'number' },
                { key: 'price_kwd', label: 'Price KWD', type: 'number' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#8A9BB0', marginBottom: '5px' }}>{field.label}</label>
                  <input type={field.type} value={String(form[field.key as keyof typeof form])}
                    onChange={e => setForm({ ...form, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                    className="input-luxury" style={inp} required={field.key === 'name'} />
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.78rem', color: '#8A9BB0' }}>
                  <input type="checkbox" checked={form.is_popular} onChange={e => setForm({ ...form, is_popular: e.target.checked })} />
                  Popular
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.78rem', color: '#8A9BB0' }}>
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                  Active
                </label>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.72rem', color: '#8A9BB0' }}>Features</label>
                <button type="button" onClick={() => setForm({ ...form, features: [...form.features, ''] })} style={{ fontSize: '0.72rem', color: '#D4AF37', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add</button>
              </div>
              {form.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input type="text" value={f} onChange={e => { const arr = [...form.features]; arr[i] = e.target.value; setForm({ ...form, features: arr }); }}
                    placeholder={`Feature ${i + 1}`} className="input-luxury" style={{ ...inp, flex: 1 }} />
                  <button type="button" onClick={() => setForm({ ...form, features: form.features.filter((_, idx) => idx !== i) })}
                    style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#EF4444', display: 'flex' }}>
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button type="submit" disabled={saving} className="btn-gold"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px', borderRadius: '10px', fontFamily: 'Cinzel,serif', fontSize: '0.78rem', cursor: 'pointer', border: 'none' }}>
                <Check size={13} /> {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowAdd(false); setEditId(null); }} className="btn-ghost"
                style={{ padding: '9px 20px', borderRadius: '10px', fontSize: '0.78rem', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #D4AF37', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="plan-cards" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {plans.map(plan => (
              <div key={plan.id} className="glass" style={{ borderRadius: '14px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#F0EDE4', fontFamily: 'Cinzel,serif' }}>{plan.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#8A9BB0' }}>{plan.description}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => startEdit(plan)} style={{ background: 'rgba(212,175,55,0.1)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#D4AF37', display: 'flex' }}><Edit2 size={13} /></button>
                    <button onClick={() => deletePlan(plan.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#EF4444', display: 'flex' }}><Trash2 size={13} /></button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.75rem' }}>
                  <span style={{ color: '#D4AF37' }}>₹{plan.price_inr?.toLocaleString()}</span>
                  <span style={{ color: '#8A9BB0' }}>﷼{plan.price_sar}</span>
                  <span style={{ color: '#8A9BB0' }}>KD {plan.price_kwd}</span>
                  {plan.is_popular && <span style={{ color: '#D4AF37' }}>★ Popular</span>}
                  <span className={plan.is_active ? 'badge-new' : 'badge-rejected'}>{plan.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            ))}
            {!plans.length && <div style={{ textAlign: 'center', padding: '40px', color: '#8A9BB0' }}>No plans yet</div>}
          </div>

          {/* Desktop table */}
          <div className="plan-table glass" style={{ borderRadius: '16px', overflow: 'hidden', display: 'none' }}>
            <table className="table-luxury">
              <thead><tr><th>Name</th><th>INR</th><th>SAR</th><th>KWD</th><th>Popular</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {plans.map(plan => (
                  <tr key={plan.id}>
                    <td style={{ fontWeight: 500 }}>{plan.name}</td>
                    <td>₹{plan.price_inr?.toLocaleString()}</td>
                    <td>﷼{plan.price_sar}</td>
                    <td>KD {plan.price_kwd}</td>
                    <td>{plan.is_popular ? <span style={{ color: '#D4AF37' }}>★ Yes</span> : 'No'}</td>
                    <td><span className={plan.is_active ? 'badge-new' : 'badge-rejected'}>{plan.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => startEdit(plan)} style={{ background: 'rgba(212,175,55,0.1)', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#D4AF37', display: 'flex' }}><Edit2 size={12} /></button>
                        <button onClick={() => deletePlan(plan.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#EF4444', display: 'flex' }}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!plans.length && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#8A9BB0' }}>No plans yet</td></tr>}
              </tbody>
            </table>
          </div>
          <style>{`@media(min-width:900px){.plan-cards{display:none!important}.plan-table{display:block!important}}`}</style>
        </>
      )}
    </div>
  );
}
