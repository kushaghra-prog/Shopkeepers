import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiPhone, FiMapPin, FiClock, FiPackage, FiPrinter } from 'react-icons/fi';
import api from '../api/axios';
import { formatCurrency, formatDate } from '../utils/formatters';
import { STATUS_COLORS } from '../utils/constants';
import OrderReceipt from '../components/OrderReceipt';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch { toast.error('Order not found'); navigate('/orders'); }
      finally { setLoading(false); }
    };
    fetchOrder();
  }, [id]);

  const updateStatus = async (status) => {
    try {
      const { data } = await api.put(`/orders/${id}/status`, { status });
      setOrder(data);
      toast.success(`Order ${status.toLowerCase()}`);
    } catch (err) { toast.error('Failed to update'); }
  };

  const timelineSteps = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];
  const currentStep = order ? timelineSteps.indexOf(order.status) : -1;

  if (loading) return <div className="space-y-6">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>;
  if (!order) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/orders')} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500"><FiArrowLeft size={22} /></button>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{order.orderNumber}</h1>
            <p className="text-sm text-surface-500">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowReceipt(true)} className="flex items-center gap-2 px-4 py-2 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-200 font-medium rounded-xl text-sm transition-all" title="Print Receipt">
            <FiPrinter size={16} /> Receipt
          </button>
          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${STATUS_COLORS[order.status] || ''}`}>{order.status}</span>
        </div>
      </div>

      {/* Timeline */}
      {order.status !== 'Cancelled' && order.status !== 'Rejected' && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-6">Order Progress</h3>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-surface-200 dark:bg-surface-700 rounded-full">
              <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500" style={{ width: `${Math.max(0, currentStep) * 25}%` }} />
            </div>
            {timelineSteps.map((step, i) => (
              <div key={step} className="relative flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= currentStep ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/30' : 'bg-surface-200 dark:bg-surface-700 text-surface-400'}`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-2 font-medium ${i <= currentStep ? 'text-brand-500' : 'text-surface-400'}`}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-4">Customer Details</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3"><FiUser className="text-brand-500" size={18} /><div><p className="text-xs text-surface-400">Name</p><p className="font-medium text-surface-900 dark:text-white">{order.customer?.name || 'N/A'}</p></div></div>
            <div className="flex items-center gap-3"><FiPhone className="text-brand-500" size={18} /><div><p className="text-xs text-surface-400">Phone</p><p className="font-medium text-surface-900 dark:text-white">{order.customer?.phone || 'N/A'}</p></div></div>
            <div className="flex items-start gap-3"><FiMapPin className="text-brand-500 mt-0.5" size={18} /><div><p className="text-xs text-surface-400">Delivery Address</p><p className="font-medium text-surface-900 dark:text-white">{order.deliveryAddress}</p></div></div>
            {order.deliveryInstructions && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800"><p className="text-xs text-amber-600 dark:text-amber-400 font-medium">📝 {order.deliveryInstructions}</p></div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-surface-500">Payment Method</span><span className={`font-medium px-2.5 py-0.5 rounded-full text-xs ${order.paymentMethod === 'Online' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>{order.paymentMethod}</span></div>
            <div className="flex justify-between text-sm"><span className="text-surface-500">Payment Status</span><span className="font-medium text-surface-900 dark:text-white">{order.paymentStatus}</span></div>
            {order.estimatedDeliveryTime && <div className="flex justify-between text-sm"><span className="text-surface-500">Est. Delivery</span><span className="font-medium text-surface-900 dark:text-white">{order.estimatedDeliveryTime} min</span></div>}
            {order.deliveryPartner && <div className="flex justify-between text-sm"><span className="text-surface-500">Delivery Partner</span><span className="font-medium text-surface-900 dark:text-white">{order.deliveryPartner.name}</span></div>}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-4">Items Ordered</h3>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-900/50">
              <div className="flex items-center gap-3">
                {(item.image || item.menuItem?.image) ? (
                  <img src={item.image || item.menuItem?.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover ring-1 ring-surface-200 dark:ring-surface-700" />
                ) : (
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold ${item.menuItem?.isVeg !== false ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {item.menuItem?.isVeg !== false ? '🟢' : '🔴'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-surface-900 dark:text-white">{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`inline-flex items-center text-[10px] font-semibold ${item.menuItem?.isVeg !== false ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>{item.menuItem?.isVeg !== false ? '● VEG' : '● NON-VEG'}</span>
                    <span className="text-xs text-surface-400">× {item.quantity}</span>
                  </div>
                </div>
              </div>
              <p className="font-semibold text-surface-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
          <div className="flex justify-between pt-3 border-t border-surface-200 dark:border-surface-700">
            <span className="text-lg font-bold text-surface-900 dark:text-white">Total</span>
            <span className="text-lg font-bold text-brand-500">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!['Delivered', 'Cancelled', 'Rejected'].includes(order.status) && (
        <div className="flex gap-3 flex-wrap">
          {order.status === 'Pending' && <><button onClick={() => updateStatus('Accepted')} className="btn-success">Accept Order</button><button onClick={() => updateStatus('Rejected')} className="btn-danger">Reject Order</button></>}
          {order.status === 'Accepted' && <button onClick={() => updateStatus('Preparing')} className="btn-primary">Start Preparing</button>}
          {order.status === 'Preparing' && <button onClick={() => updateStatus('Out for Delivery')} className="btn-primary">Mark Out for Delivery</button>}
          {order.status === 'Out for Delivery' && <button onClick={() => updateStatus('Delivered')} className="btn-success">Mark as Delivered</button>}
          <button onClick={() => updateStatus('Cancelled')} className="btn-secondary">Cancel Order</button>
        </div>
      )}

      {/* Timeline Events */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-4">Order Timeline</h3>
        <div className="space-y-4">
          {order.timeline?.map((event, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-3 h-3 mt-1 rounded-full bg-brand-500 ring-4 ring-brand-100 dark:ring-brand-900/30" />
              <div><p className="font-medium text-surface-900 dark:text-white">{event.status}</p><p className="text-xs text-surface-400">{formatDate(event.timestamp)}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && <OrderReceipt order={order} onClose={() => setShowReceipt(false)} />}
    </div>
  );
}
