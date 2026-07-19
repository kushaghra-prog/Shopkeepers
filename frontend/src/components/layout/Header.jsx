import { useState, useRef, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiBell, FiSun, FiMoon, FiUser, FiLogOut, FiSettings, FiChevronDown, FiShoppingBag, FiClock, FiExternalLink } from 'react-icons/fi';
import { ThemeContext } from '../../context/ThemeContext';
import { OrderContext } from '../../context/OrderContext';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/formatters';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/orders': 'Orders',
  '/menu': 'Menu Management',
  '/customers': 'Customers',
  '/payments': 'Payments & Earnings',
  '/delivery': 'Delivery Management',
  '/settings': 'Settings',
};

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { liveOrders, newOrderCount, clearNotifications } = useContext(OrderContext);
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const title = pageTitles[pathname] || (pathname.startsWith('/orders/') ? 'Order Details' : 'Dashboard');

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 h-16 bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-700 no-print">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300">
          <FiMenu size={22} />
        </button>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-surface-900 dark:text-white">{title}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Notification Bell with Dropdown */}
        <div ref={notifRef} className="relative">
          <button onClick={() => { setNotifOpen(p => !p); setDropdownOpen(false); }}
            className="relative p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300 transition-colors">
            <FiBell size={20} />
            {newOrderCount > 0 && (
              <>
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {newOrderCount > 9 ? '9+' : newOrderCount}
                </span>
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-40" />
              </>
            )}
          </button>

          {/* Notification Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl shadow-2xl shadow-surface-900/10 dark:shadow-black/30 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 dark:border-surface-700">
                <h3 className="font-bold text-surface-900 dark:text-white">Notifications</h3>
                {newOrderCount > 0 && (
                  <button onClick={clearNotifications} className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {liveOrders.length === 0 ? (
                  <div className="py-12 text-center">
                    <FiBell className="mx-auto mb-3 text-surface-300 dark:text-surface-600" size={32} />
                    <p className="text-sm text-surface-400">No new notifications</p>
                  </div>
                ) : (
                  liveOrders.slice(0, 8).map((order, i) => (
                    <button key={order._id || i} onClick={() => { navigate(`/orders/${order._id}`); setNotifOpen(false); clearNotifications(); }}
                      className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors text-left border-b border-surface-50 dark:border-surface-700/30 last:border-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        order.status === 'Pending' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                        order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        <FiShoppingBag size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                            {order.orderNumber || 'New Order'}
                          </p>
                          <span className="text-[10px] text-surface-400 flex-shrink-0 flex items-center gap-1">
                            <FiClock size={10} />
                            {timeAgo(order.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-surface-500 truncate mt-0.5">
                          {order.customer?.name || 'Customer'} • {order.items?.length || 0} items
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-bold text-brand-500">{formatCurrency(order.totalAmount || 0)}</span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            order.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                            order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                          }`}>{order.status}</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="px-5 py-3 border-t border-surface-100 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-900/30">
                <button onClick={() => { navigate('/orders'); setNotifOpen(false); clearNotifications(); }}
                  className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-brand-500 hover:text-brand-600 py-1.5 transition-colors">
                  View All Orders <FiExternalLink size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300 transition-colors" title={isDark ? 'Light mode' : 'Dark mode'}>
          {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>

        {/* User Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button onClick={() => { setDropdownOpen(p => !p); setNotifOpen(false); }} className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-brand-500/20">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden md:block text-sm font-medium text-surface-700 dark:text-surface-200">{user?.name || 'User'}</span>
            <FiChevronDown size={16} className={`text-surface-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl shadow-2xl shadow-surface-900/10 dark:shadow-black/30 py-2 animate-fade-in">
              <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700 mb-1">
                <p className="text-sm font-semibold text-surface-900 dark:text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-surface-400 truncate">{user?.email || ''}</p>
              </div>
              <button onClick={() => { navigate('/settings'); setDropdownOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                <FiUser size={16} /> Profile
              </button>
              <button onClick={() => { navigate('/settings'); setDropdownOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                <FiSettings size={16} /> Settings
              </button>
              <hr className="my-1 border-surface-200 dark:border-surface-700" />
              <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <FiLogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
