import { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiShoppingBag, FiBook, FiUsers, FiCreditCard, FiTruck, FiSettings, FiX, FiChevronLeft, FiChevronRight, FiMoon, FiSun } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { ThemeContext } from '../../context/ThemeContext';
import { OrderContext } from '../../context/OrderContext';
import api from '../../api/axios';

const icons = { FiGrid, FiShoppingBag, FiBook, FiUsers, FiCreditCard, FiTruck, FiSettings };
const links = [
  { name: 'Dashboard', path: '/dashboard', icon: 'FiGrid' },
  { name: 'Orders', path: '/orders', icon: 'FiShoppingBag', badge: true },
  { name: 'Menu', path: '/menu', icon: 'FiBook' },
  { name: 'Customers', path: '/customers', icon: 'FiUsers' },
  { name: 'Payments', path: '/payments', icon: 'FiCreditCard' },
  { name: 'Delivery', path: '/delivery', icon: 'FiTruck' },
  { name: 'Settings', path: '/settings', icon: 'FiSettings' },
];

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const { user, updateProfile } = useAuth();
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { newOrderCount } = useContext(OrderContext);
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleRestaurant = async () => {
    try { await api.put('/auth/profile', { isOpen: !user?.isOpen }); updateProfile({ isOpen: !user?.isOpen }); } catch {}
  };

  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const formatDate = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isCollapsed ? 'w-20' : 'w-64'}`}
      data-sidebar>
      {/* Gradient accent bar */}
      <div className="h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500 flex-shrink-0" />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-500/25">S</div>
            <div>
              <h1 className="font-bold text-surface-900 dark:text-white text-sm">Shopkeepers</h1>
              <p className="text-[10px] text-surface-400">{user?.restaurantName || 'Restaurant'}</p>
            </div>
          </div>
        )}
        {isCollapsed && <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-500/25">S</div>}
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500"><FiX size={20} /></button>
      </div>

      {/* Live Clock */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700/50">
          <p className="text-xl font-bold text-surface-900 dark:text-white tabular-nums tracking-tight">{formatTime(time)}</p>
          <p className="text-[11px] text-surface-400">{formatDate(time)}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(link => {
          const Icon = icons[link.icon];
          return (
            <NavLink key={link.path} to={link.path} onClick={onClose}
              className={({ isActive }) => `group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 relative ${isActive
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25'
                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 hover:translate-x-1'
              } ${isCollapsed ? 'justify-center px-3' : ''}`}>
              <Icon size={20} className="flex-shrink-0" />
              {!isCollapsed && <span>{link.name}</span>}
              {/* Order count badge */}
              {link.badge && newOrderCount > 0 && (
                <span className={`${isCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold`}>
                  {newOrderCount > 9 ? '9+' : newOrderCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-surface-200 dark:border-surface-700 space-y-3">
        {/* Theme Toggle */}
        {!isCollapsed && (
          <button onClick={toggleTheme} className="flex items-center justify-between w-full px-3 py-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
            <div className="flex items-center gap-2.5">
              {isDark ? <FiMoon size={16} className="text-purple-400" /> : <FiSun size={16} className="text-amber-500" />}
              <span className="text-sm font-medium text-surface-600 dark:text-surface-400">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <div className={`relative w-10 h-5 rounded-full transition-colors ${isDark ? 'bg-purple-500' : 'bg-amber-400'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </button>
        )}

        {/* Restaurant Toggle */}
        {!isCollapsed && (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-900/50">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${user?.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-surface-300 dark:bg-surface-600'}`} />
              <span className="text-sm font-medium text-surface-600 dark:text-surface-400">{user?.isOpen ? 'Open' : 'Closed'}</span>
            </div>
            <button onClick={toggleRestaurant} className={`relative w-10 h-5 rounded-full transition-colors ${user?.isOpen ? 'bg-emerald-500' : 'bg-surface-300 dark:bg-surface-600'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${user?.isOpen ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        )}

        {/* Collapse Toggle */}
        <button onClick={onToggleCollapse} className="hidden lg:flex items-center justify-center w-full p-2 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
          {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
