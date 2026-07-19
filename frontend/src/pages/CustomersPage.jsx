import { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiPhone, FiShoppingBag, FiDollarSign } from 'react-icons/fi';
import api from '../api/axios';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/customers', { params: search ? { search } : {} });
        setCustomers(data);
      } catch { toast.error('Failed to load customers'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [search]);

  const viewCustomer = async (customer) => {
    setSelected(customer);
    try {
      const { data } = await api.get(`/customers/${customer._id}/orders`);
      setOrders(data);
    } catch { setOrders([]); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-surface-900 dark:text-white">Customers</h2><p className="text-sm text-surface-500">{customers.length} total customers</p></div>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-11" placeholder="Search by name or phone..." />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-surface-50 dark:bg-surface-800/50">
                  {['Customer', 'Phone', 'Orders', 'Total Spent', 'Last Order'].map(h => <th key={h} className="text-left py-3 px-4 text-surface-500 font-medium text-xs uppercase">{h}</th>)}
                </tr></thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c._id} onClick={() => viewCustomer(c)} className={`border-t border-surface-100 dark:border-surface-700/50 cursor-pointer transition-colors ${selected?._id === c._id ? 'bg-brand-50 dark:bg-brand-900/10' : 'hover:bg-surface-50 dark:hover:bg-surface-800/30'}`}>
                      <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">{c.name[0]}</div><p className="font-medium text-surface-900 dark:text-white">{c.name}</p></div></td>
                      <td className="py-3 px-4 text-surface-600 dark:text-surface-400">{c.phone}</td>
                      <td className="py-3 px-4 font-medium text-surface-900 dark:text-white">{c.totalOrders}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(c.totalSpent)}</td>
                      <td className="py-3 px-4 text-surface-500 text-xs">{formatDate(c.lastOrderDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {customers.length === 0 && <p className="text-center py-12 text-surface-400">No customers found</p>}
            </div>
          )}
        </div>

        {/* Customer Detail */}
        <div className="glass-card p-6">
          {selected ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-2xl mb-3">{selected.name[0]}</div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white">{selected.name}</h3>
                <p className="text-sm text-surface-500">{selected.phone}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-900/50 text-center"><p className="text-2xl font-bold text-surface-900 dark:text-white">{selected.totalOrders}</p><p className="text-xs text-surface-400">Orders</p></div>
                <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-900/50 text-center"><p className="text-2xl font-bold text-emerald-500">{formatCurrency(selected.totalSpent)}</p><p className="text-xs text-surface-400">Total Spent</p></div>
              </div>
              {selected.address && <div><p className="text-xs text-surface-400 mb-1">Address</p><p className="text-sm text-surface-700 dark:text-surface-300">{selected.address}</p></div>}
              <div>
                <h4 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">Recent Orders</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {orders.map(o => (
                    <div key={o._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-900/50">
                      <div><p className="text-sm font-medium text-surface-900 dark:text-white">{o.orderNumber}</p><p className="text-xs text-surface-400">{formatDate(o.createdAt)}</p></div>
                      <p className="font-semibold text-sm text-surface-900 dark:text-white">{formatCurrency(o.totalAmount)}</p>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-sm text-surface-400 text-center py-4">No orders</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-surface-400">
              <FiUser size={48} className="mb-3 opacity-30" />
              <p className="text-sm">Select a customer to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
