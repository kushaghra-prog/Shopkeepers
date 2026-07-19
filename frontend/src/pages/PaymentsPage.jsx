import { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiClock, FiCalendar } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api/axios';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const [earnings, setEarnings] = useState(null);
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [e, s, p] = await Promise.all([
          api.get('/payments/earnings'),
          api.get('/payments/summary'),
          api.get('/payments', { params: { limit: 20 } }),
        ]);
        setEarnings(e.data);
        setSummary(s.data);
        setPayments(p.data.payments);
      } catch { toast.error('Failed to load payments'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const earningCards = earnings ? [
    { label: 'Total Earnings', value: formatCurrency(earnings.total), icon: FiDollarSign, color: 'from-emerald-500 to-emerald-600' },
    { label: 'This Month', value: formatCurrency(earnings.thisMonth), icon: FiTrendingUp, color: 'from-blue-500 to-blue-600' },
    { label: "Today's Earnings", value: formatCurrency(earnings.today), icon: FiCalendar, color: 'from-purple-500 to-purple-600' },
    { label: 'Pending', value: formatCurrency(earnings.pending), icon: FiClock, color: 'from-amber-500 to-amber-600' },
  ] : [];

  const pieData = summary ? [
    { name: 'Online', value: summary.Online?.total || 0, color: '#22c55e' },
    { name: 'COD', value: summary.COD?.total || 0, color: '#f59e0b' },
  ].filter(d => d.value > 0) : [];

  if (loading) return <div className="space-y-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div><div className="skeleton h-80 rounded-2xl" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Earning Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {earningCards.map((card, i) => (
          <div key={i} className="glass-card p-5 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-3`}><card.icon size={20} /></div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-surface-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Monthly Earnings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={earnings?.monthlyChart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`} />
              <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Earnings']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="earnings" fill="url(#earningsGrad)" radius={[6, 6, 0, 0]} />
              <defs><linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" /><stop offset="100%" stopColor="#16a34a" /></linearGradient></defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* COD vs Online Pie */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={5}>{pieData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip formatter={v => formatCurrency(v)} /></PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((d, i) => (
              <div key={i} className="text-center"><div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-sm text-surface-500">{d.name}</span></div><p className="font-bold text-surface-900 dark:text-white">{formatCurrency(d.value)}</p><p className="text-xs text-surface-400">{summary?.[d.name]?.count || 0} transactions</p></div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-surface-200 dark:border-surface-700"><h3 className="text-lg font-bold text-surface-900 dark:text-white">Payment History</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-surface-50 dark:bg-surface-800/50">{['Order #', 'Amount', 'Method', 'Status', 'Date'].map(h => <th key={h} className="text-left py-3 px-4 text-surface-500 font-medium text-xs uppercase">{h}</th>)}</tr></thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id} className="border-t border-surface-100 dark:border-surface-700/50">
                  <td className="py-3 px-4 font-medium text-surface-900 dark:text-white">{p.order?.orderNumber || 'N/A'}</td>
                  <td className="py-3 px-4 font-semibold text-surface-900 dark:text-white">{formatCurrency(p.amount)}</td>
                  <td className="py-3 px-4"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${p.paymentMethod === 'Online' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>{p.paymentMethod}</span></td>
                  <td className="py-3 px-4"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${p.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : p.status === 'Failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'}`}>{p.status}</span></td>
                  <td className="py-3 px-4 text-surface-500 text-xs">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
