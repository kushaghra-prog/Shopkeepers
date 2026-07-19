import { forwardRef } from 'react';
import { FiPrinter } from 'react-icons/fi';

const OrderReceipt = forwardRef(({ order, onClose }, ref) => {
  if (!order) return null;

  const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const deliveryFee = order.totalAmount - subtotal > 0 ? order.totalAmount - subtotal : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} ref={ref}>
        {/* Print Button - hidden in print */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 no-print">
          <h3 className="text-lg font-bold text-gray-900">Order Receipt</h3>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium text-sm transition-colors">
              <FiPrinter size={16} /> Print
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors">
              Close
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-8" id="receipt-content">
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              #receipt-content, #receipt-content * { visibility: visible !important; }
              #receipt-content { position: fixed; left: 0; top: 0; width: 100%; padding: 20px; }
              .no-print { display: none !important; }
            }
          `}</style>

          {/* Header */}
          <div className="text-center mb-6 pb-6 border-b-2 border-dashed border-gray-200">
            <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-black text-2xl mb-3 print:bg-gray-800">
              S
            </div>
            <h1 className="text-2xl font-black text-gray-900">Shopkeepers</h1>
            <p className="text-sm text-gray-500 mt-1">Restaurant Management</p>
            <p className="text-xs text-gray-400 mt-0.5">www.shopkeepers.app</p>
          </div>

          {/* Order Info */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Order Number</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Date</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Customer */}
          <div className="mb-6 pb-4 border-b border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Customer Details</p>
            <p className="text-sm font-semibold text-gray-900">{order.customer?.name || 'N/A'}</p>
            {order.customer?.phone && <p className="text-sm text-gray-600">📞 {order.customer.phone}</p>}
            {order.customer?.email && <p className="text-sm text-gray-600">✉️ {order.customer.email}</p>}
            {order.deliveryAddress && <p className="text-sm text-gray-600 mt-1">📍 {order.deliveryAddress}</p>}
            {order.deliveryInstructions && <p className="text-xs text-gray-400 italic mt-1">Note: {order.deliveryInstructions}</p>}
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Order Items</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 text-gray-500 font-medium text-xs">#</th>
                  <th className="text-left py-2 text-gray-500 font-medium text-xs">Item</th>
                  <th className="text-center py-2 text-gray-500 font-medium text-xs">Qty</th>
                  <th className="text-right py-2 text-gray-500 font-medium text-xs">Price</th>
                  <th className="text-right py-2 text-gray-500 font-medium text-xs">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2.5 text-gray-400 text-xs">{i + 1}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px]">{item.menuItem?.isVeg ? '🟢' : '🔴'}</span>
                        <span className="font-medium text-gray-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-center text-gray-700">{item.quantity}</td>
                    <td className="py-2.5 text-right text-gray-700">₹{item.price}</td>
                    <td className="py-2.5 text-right font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mb-6 pb-4 border-b-2 border-dashed border-gray-200">
            <div className="flex justify-between text-sm text-gray-600 mb-1.5">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-sm text-gray-600 mb-1.5">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 mt-2 border-t border-gray-200">
              <span>Total</span>
              <span>₹{(order.totalAmount || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Payment & Status */}
          <div className="flex justify-between mb-6 text-sm">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Payment</p>
              <p className="font-semibold text-gray-900 mt-0.5">{order.paymentMethod || 'COD'}</p>
              <p className="text-xs text-gray-400">{order.paymentStatus || 'Pending'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Status</p>
              <p className={`font-semibold mt-0.5 ${order.status === 'Delivered' ? 'text-emerald-600' : order.status === 'Cancelled' ? 'text-red-600' : 'text-amber-600'}`}>
                {order.status}
              </p>
            </div>
          </div>

          {/* Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Order Timeline</p>
              <div className="space-y-1.5">
                {order.timeline.map((t, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${i === order.timeline.length - 1 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      <span className="font-medium text-gray-700">{t.status}</span>
                    </div>
                    <span className="text-gray-400">
                      {new Date(t.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-6 border-t-2 border-dashed border-gray-200">
            <p className="text-sm font-semibold text-gray-700">Thank you for your order! 🙏</p>
            <p className="text-xs text-gray-400 mt-1">Powered by Shopkeepers Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
});

OrderReceipt.displayName = 'OrderReceipt';
export default OrderReceipt;
