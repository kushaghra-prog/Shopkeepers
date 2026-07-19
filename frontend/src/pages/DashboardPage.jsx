import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiTrendingUp, FiTrendingDown, FiArrowRight, FiPlus, FiCreditCard } from 'react-icons/fi';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api/axios';
import { formatCurrency, formatDate } from '../utils/formatters';
import { STATUS_COLORS } from '../utils/constants';

// Animated counter hook
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (target == null) return;
    const num = typeof target === 'number' ? target : parseFloat(String(target).replace(/[^0-9.]/g, '')) || 0;
    if (num === 0) { setCount(0); return; }
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(num * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return count;
}

function StatCard({ card, index }) {
  const animatedValue = useCountUp(typeof card.rawValue === 'number' ? card.rawValue : 0);
  return (
    <div className="glass-card p-5 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${index * 80}ms` }}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}
          style={{ boxShadow: `0 8px 16px -4px ${card.shadowColor}` }}>
          <card.icon size={20} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${card.growth >= 0
          ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'
          : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'}`}>
          {card.growth >= 0 ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
          {card.growth >= 0 ? '+' : ''}{card.growth}%
        </div>
      </div>
      <p className="text-2xl font-bold text-surface-900 dark:text-white tabular-nums">
        {card.isCurrency ? '₹' + animatedValue.toLocaleString() : animatedValue}
      </p>
      <p className="text-xs text-surface-500 mt-1">{card.label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, w, r] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/weekly-sales'),
          api.get('/dashboard/recent-orders'),
        ]);
        setStats(s.data);
        setWeekly(w.data);
        setRecent(r.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const statCards = stats ? [
    { label: 'Total Orders', rawValue: stats.totalOrders, icon: FiShoppingBag, color: 'from-blue-500 to-indigo-600', shadowColor: 'rgba(59,130,246,0.3)', growth: 12.5 },
    { label: 'Total Revenue', rawValue: stats.totalRevenue, isCurrency: true, icon: FiDollarSign, color: 'from-emerald-500 to-teal-600', shadowColor: 'rgba(16,185,129,0.3)', growth: 8.2 },
    { label: 'Pending Orders', rawValue: stats.pendingOrders, icon: FiClock, color: 'from-amber-500 to-orange-600', shadowColor: 'rgba(245,158,11,0.3)', growth: -3.1 },
    { label: 'Delivered', rawValue: stats.deliveredOrders, icon: FiCheckCircle, color: 'from-green-500 to-emerald-600', shadowColor: 'rgba(34,197,94,0.3)', growth: 15.7 },
    { label: 'Cancelled', rawValue: stats.cancelledOrders, icon: FiXCircle, color: 'from-red-500 to-rose-600', shadowColor: 'rgba(239,68,68,0.3)', growth: -5.3 },
    { label: "Today's Sales", rawValue: stats.todayRevenue, isCurrency: true, icon: FiTrendingUp, color: 'from-purple-500 to-violet-600', shadowColor: 'rgba(168,85,247,0.3)', growth: 22.0 },
  ] : [];

  const pieData = stats ? [
    { name: 'Delivered', value: stats.deliveredOrders, color: '#22c55e' },
    { name: 'Pending', value: stats.pendingOrders, color: '#f59e0b' },
    { name: 'Cancelled', value: stats.cancelledOrders, color: '#ef4444' },
  ].filter(d => d.value > 0) : [];

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>
      <div className="grid lg:grid-cols-2 gap-6"><div className="skeleton h-80 rounded-2xl" /><div className="skeleton h-80 rounded-2xl" /></div>
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Welcome back! 👋</h2>
          <p className="text-sm text-surface-500 mt-0.5">Here's what's happening with your restaurant today.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/orders')} className="flex items-center gap-2 px-4 py-2.5 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-200 font-medium rounded-xl text-sm transition-all">
            <FiShoppingBag size={16} /> Orders
          </button>
          <button onClick={() => navigate('/menu')} className="flex items-center gap-2 px-4 py-2.5 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-200 font-medium rounded-xl text-sm transition-all">
            <FiPlus size={16} /> Add Item
          </button>
          <button onClick={() => navigate('/payments')} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-brand-500/25 transition-all">
            <FiCreditCard size={16} /> Payments
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => <StatCard key={i} card={card} index={i} />)}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Sales Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white">Weekly Sales</h3>
              <p className="text-xs text-surface-500 mt-0.5">Revenue and order trends</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-500" /> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-400" /> Orders</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weekly} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '13px' }} />
              <Bar dataKey="revenue" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="orders" fill="url(#barGradient2)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#EA580C" />
                </linearGradient>
                <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-1">Order Status</h3>
          <p className="text-xs text-surface-500 mb-4">Distribution overview</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={4} strokeWidth={0}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '13px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-3">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-surface-600 dark:text-surface-400">{d.name}: <strong>{d.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Trend Area Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">Revenue Trend</h3>
            <p className="text-xs text-surface-500 mt-0.5">Weekly revenue flow</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weekly}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F97316" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#F97316" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '13px' }} />
            <Area type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={3} fill="url(#areaGradient)" dot={{ fill: '#F97316', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#EA580C' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">Recent Orders</h3>
            <p className="text-xs text-surface-500 mt-0.5">Latest customer orders</p>
          </div>
          <button onClick={() => navigate('/orders')} className="flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 font-semibold transition-colors">
            View All <FiArrowRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-surface-500 font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map(order => (
                <tr key={order._id} onClick={() => navigate(`/orders/${order._id}`)}
                  className="border-b border-surface-100 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer transition-all duration-200 hover:translate-x-0.5">
                  <td className="py-3 px-4 font-semibold text-brand-500">{order.orderNumber}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xs">
                        {order.customer?.name?.[0] || '?'}
                      </div>
                      <span className="text-surface-700 dark:text-surface-300 font-medium">{order.customer?.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {order.items?.slice(0, 2).map((item, i) => (
                        (item.image || item.menuItem?.image) ? (
                          <img key={i} src={item.image || item.menuItem?.image} alt={item.name} title={item.name} className="w-6 h-6 rounded object-cover ring-1 ring-surface-200 dark:ring-surface-700" />
                        ) : null
                      ))}
                      <span className="text-xs text-surface-500 ml-1 truncate max-w-[120px]">{order.items?.map(i => i.name).join(', ')}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-surface-900 dark:text-white">{formatCurrency(order.totalAmount)}</td>
                  <td className="py-3 px-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || ''}`}>{order.status}</span></td>
                  <td className="py-3 px-4 text-surface-500 text-xs">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recent.length === 0 && <p className="text-center py-8 text-surface-400">No orders yet</p>}
        </div>
      </div>
    </div>
  );
}
