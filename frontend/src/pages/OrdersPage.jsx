import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiDownload, FiFileText, FiCheck, FiX } from 'react-icons/fi';
import api from '../api/axios';
import { formatCurrency, formatDate } from '../utils/formatters';
import { STATUS_COLORS, ORDER_STATUSES } from '../utils/constants';
import { OrderContext } from '../context/OrderContext';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedSearch = useDebounce(search);
  const navigate = useNavigate();
  const { liveOrders } = useContext(OrderContext);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (status !== 'All') params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const { data } = await api.get('/orders', { params });
      setOrders(data.orders);
      setTotalPages(data.pages);
    } catch (err) { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [debouncedSearch, status, startDate, endDate, page]);

  // Merge live orders
  useEffect(() => {
    if (liveOrders.length > 0) {
      setOrders(prev => {
        const merged = [...prev];
        liveOrders.forEach(lo => {
          const idx = merged.findIndex(o => o._id === lo._id);
          if (idx >= 0) merged[idx] = lo;
          else merged.unshift(lo);
        });
        return merged;
      });
    }
  }, [liveOrders]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order ${newStatus.toLowerCase()}`);
      fetchOrders();
    } catch (err) { toast.error('Failed to update order'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-11" placeholder="Search orders..." />
          </div>
          <div className="flex gap-3 flex-wrap">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field w-auto" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field w-auto" />
            <button onClick={() => exportToPDF(orders, 'Orders Report')} className="btn-secondary flex items-center gap-2"><FiFileText size={16} /> PDF</button>
            <button onClick={() => exportToExcel(orders)} className="btn-secondary flex items-center gap-2"><FiDownload size={16} /> Excel</button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
          {ORDER_STATUSES.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${status === s ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md' : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16"><p className="text-surface-400 text-lg">No orders found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50 dark:bg-surface-800/50">
                  {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3.5 px-4 text-surface-500 font-medium text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-t border-surface-100 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <button onClick={() => navigate(`/orders/${order._id}`)} className="font-semibold text-brand-500 hover:text-brand-600">{order.orderNumber}</button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">{order.customer?.name?.[0] || '?'}</div><div><p className="font-medium text-surface-900 dark:text-white">{order.customer?.name || 'N/A'}</p><p className="text-xs text-surface-400">{order.customer?.phone}</p></div></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1 max-w-[200px]">
                        {order.items?.slice(0, 2).map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            {(item.image || item.menuItem?.image) ? (
                              <img src={item.image || item.menuItem?.image} alt={item.name} className="w-6 h-6 rounded object-cover flex-shrink-0" />
                            ) : (
                              <span className="text-[10px]">{item.menuItem?.isVeg !== false ? '🟢' : '🔴'}</span>
                            )}
                            <span className="text-xs text-surface-600 dark:text-surface-400 truncate">{item.name} ×{item.quantity}</span>
                          </div>
                        ))}
                        {order.items?.length > 2 && <p className="text-[10px] text-surface-400">+{order.items.length - 2} more</p>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-surface-900 dark:text-white">{formatCurrency(order.totalAmount)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.paymentMethod === 'Online' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || ''}`}>{order.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-surface-500 text-xs">{formatDate(order.createdAt)}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1.5">
                        {order.status === 'Pending' && (
                          <>
                            <button onClick={() => updateStatus(order._id, 'Accepted')} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" title="Accept"><FiCheck size={16} /></button>
                            <button onClick={() => updateStatus(order._id, 'Rejected')} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400" title="Reject"><FiX size={16} /></button>
                          </>
                        )}
                        {order.status === 'Accepted' && (
                          <button onClick={() => updateStatus(order._id, 'Preparing')} className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400">Prepare</button>
                        )}
                        {order.status === 'Preparing' && (
                          <button onClick={() => updateStatus(order._id, 'Out for Delivery')} className="px-3 py-1 rounded-lg text-xs font-medium bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400">Dispatch</button>
                        )}
                        {order.status === 'Out for Delivery' && (
                          <button onClick={() => updateStatus(order._id, 'Delivered')} className="px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">Delivered</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-surface-200 dark:border-surface-700">
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-brand-500 text-white' : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
