export const ORDER_STATUSES = ['All', 'Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled', 'Rejected'];

export const STATUS_COLORS = {
  'Pending': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'confirmed': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Accepted': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Preparing': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Out for Delivery': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  'Delivered': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const FOOD_CATEGORIES = ['All', 'Starters', 'Main Course', 'Desserts', 'Beverages', 'Snacks', 'Thali', 'Biryani', 'Chinese', 'South Indian', 'Pizza', 'Burger', 'Sides', 'Combos', 'Drinks', 'Chicken'];

export const SIDEBAR_LINKS = [
  { name: 'Dashboard', path: '/dashboard', icon: 'FiGrid' },
  { name: 'Orders', path: '/orders', icon: 'FiShoppingBag' },
  { name: 'Menu', path: '/menu', icon: 'FiBook' },
  { name: 'Customers', path: '/customers', icon: 'FiUsers' },
  { name: 'Payments', path: '/payments', icon: 'FiCreditCard' },
  { name: 'Delivery', path: '/delivery', icon: 'FiTruck' },
  { name: 'Settings', path: '/settings', icon: 'FiSettings' },
];
