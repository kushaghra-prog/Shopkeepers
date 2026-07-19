import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiPhone, FiTruck, FiStar, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function DeliveryPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', vehicleNumber: '', vehicleType: 'Bike' });

  const fetchPartners = async () => {
    try { const { data } = await api.get('/delivery-partners'); setPartners(data); }
    catch { toast.error('Failed to load partners'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPartners(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', phone: '', vehicleNumber: '', vehicleType: 'Bike' }); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, phone: p.phone, vehicleNumber: p.vehicleNumber, vehicleType: p.vehicleType }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/delivery-partners/${editing._id}`, form); toast.success('Updated!'); }
      else { await api.post('/delivery-partners', form); toast.success('Partner added!'); }
      setShowModal(false); fetchPartners();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const toggleAvail = async (id) => {
    try { await api.patch(`/delivery-partners/${id}/toggle`); fetchPartners(); }
    catch { toast.error('Failed'); }
  };

  const vehicleEmoji = { Bike: '🏍️', Scooter: '🛵', Bicycle: '🚲', Car: '🚗' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-surface-900 dark:text-white">Delivery Partners</h2><p className="text-sm text-surface-500">{partners.length} partners</p></div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus size={18} /> Add Partner</button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}</div>
      ) : partners.length === 0 ? (
        <div className="text-center py-16 glass-card"><p className="text-surface-400">No delivery partners yet</p></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map(p => (
            <div key={p._id} className="glass-card p-5 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-lg">{p.name[0]}</div>
                  <div>
                    <h3 className="font-bold text-surface-900 dark:text-white">{p.name}</h3>
                    <p className="text-sm text-surface-400 flex items-center gap-1"><FiPhone size={12} /> {p.phone}</p>
                  </div>
                </div>
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400"><FiEdit2 size={16} /></button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">Vehicle</span>
                  <span className="font-medium text-surface-900 dark:text-white">{vehicleEmoji[p.vehicleType]} {p.vehicleType} • {p.vehicleNumber}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">Deliveries</span>
                  <span className="font-medium text-surface-900 dark:text-white">{p.totalDeliveries}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">Rating</span>
                  <span className="font-medium text-amber-500 flex items-center gap-1"><FiStar size={14} /> {p.rating}</span>
                </div>
                {p.currentOrder && (
                  <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
                    <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">📦 On delivery: {p.currentOrder?.orderNumber || 'Assigned'}</p>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-surface-200 dark:border-surface-700">
                  <span className={`text-sm font-medium ${p.isAvailable ? 'text-emerald-500' : 'text-surface-400'}`}>{p.isAvailable ? '● Available' : '○ Unavailable'}</span>
                  <button onClick={() => toggleAvail(p._id)} className={p.isAvailable ? 'text-emerald-500' : 'text-surface-300'}>
                    {p.isAvailable ? <FiToggleRight size={28} /> : <FiToggleLeft size={28} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">{editing ? 'Edit Partner' : 'Add Delivery Partner'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Name</label><input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Phone</label><input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Vehicle Number</label><input value={form.vehicleNumber} onChange={e => setForm(p => ({...p, vehicleNumber: e.target.value}))} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Vehicle Type</label>
                <select value={form.vehicleType} onChange={e => setForm(p => ({...p, vehicleType: e.target.value}))} className="input-field">
                  {['Bike', 'Scooter', 'Bicycle', 'Car'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Add Partner'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
