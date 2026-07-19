import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import api from '../api/axios';
import { formatCurrency } from '../utils/formatters';
import { FOOD_CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Starters', isVeg: true, preparationTime: 30, isAvailable: true });

  const fetchItems = async () => {
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (search) params.search = search;
      const { data } = await api.get('/menu', { params });
      setItems(data);
    } catch { toast.error('Failed to load menu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, [category, search]);

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', price: '', category: 'Starters', isVeg: true, preparationTime: 30, isAvailable: true }); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ name: item.name, description: item.description, price: item.price, category: item.category, isVeg: item.isVeg, preparationTime: item.preparationTime, isAvailable: item.isAvailable }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/menu/${editing._id}`, form);
        toast.success('Item updated!');
      } else {
        await api.post('/menu', form);
        toast.success('Item added!');
      }
      setShowModal(false);
      fetchItems();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await api.delete(`/menu/${id}`); toast.success('Item deleted'); fetchItems(); }
    catch { toast.error('Failed to delete'); }
  };

  const toggleAvail = async (id) => {
    try { await api.patch(`/menu/${id}/toggle`); fetchItems(); }
    catch { toast.error('Failed to toggle'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">Menu Items</h2>
          <p className="text-sm text-surface-500">{items.length} items</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus size={18} /> Add Item</button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="relative mb-4">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-11" placeholder="Search menu items..." />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FOOD_CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${category === c ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md' : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200'}`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 glass-card"><p className="text-surface-400 text-lg">No items found</p></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item._id} className={`glass-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${!item.isAvailable ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-xs border-2 ${item.isVeg ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}`}>●</span>
                  <span className="text-xs font-medium text-surface-400 bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded-full">{item.category}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-brand-500"><FiEdit2 size={15} /></button>
                  <button onClick={() => deleteItem(item._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500"><FiTrash2 size={15} /></button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-1">{item.name}</h3>
              <p className="text-sm text-surface-400 mb-3 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-brand-500">{formatCurrency(item.price)}</p>
                <button onClick={() => toggleAvail(item._id)} className={`transition-colors ${item.isAvailable ? 'text-emerald-500' : 'text-surface-300'}`}>
                  {item.isAvailable ? <FiToggleRight size={28} /> : <FiToggleLeft size={28} />}
                </button>
              </div>
              <p className="text-xs text-surface-400 mt-2">⏱️ {item.preparationTime} min</p>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">{editing ? 'Edit Item' : 'Add New Item'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Name</label><input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Description</label><textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="input-field" rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Price (₹)</label><input type="number" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Prep Time (min)</label><input type="number" value={form.preparationTime} onChange={e => setForm(p => ({...p, preparationTime: e.target.value}))} className="input-field" /></div>
              </div>
              <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="input-field">
                  {FOOD_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isVeg} onChange={e => setForm(p => ({...p, isVeg: e.target.checked}))} className="w-4 h-4 rounded text-emerald-500" />
                  <span className="text-sm text-surface-700 dark:text-surface-300">Vegetarian</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
