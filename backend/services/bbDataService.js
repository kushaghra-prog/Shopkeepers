/**
 * Bunny Burger Data Service
 * Reads/writes Bunny Burger's JSON data files directly.
 * Transforms BB data format → SK frontend format on the fly.
 */

const fs = require('fs').promises;
const path = require('path');

// Path to Bunny Burger's server/data directory
const BB_DATA_DIR = process.env.BB_DATA_DIR || path.join(__dirname, '..', '..', '..', '..', 'food Delivery App', 'Bunny-Burger', 'server', 'data');

const ordersFile = path.join(BB_DATA_DIR, 'orders.json');
const productsFile = path.join(BB_DATA_DIR, 'products.json');

// ──────────── Low-level file I/O ────────────

async function readJson(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ──────────── Status Mapping ────────────

// BB uses 'confirmed' for new orders, SK uses 'Pending'
const BB_TO_SK_STATUS = {
  'confirmed': 'Pending',
  'cancelled': 'Cancelled',
  'pending': 'Pending',
  'Pending': 'Pending',
  'Accepted': 'Accepted',
  'Preparing': 'Preparing',
  'Out for Delivery': 'Out for Delivery',
  'Delivered': 'Delivered',
  'Cancelled': 'Cancelled',
  'Rejected': 'Rejected',
};

const SK_TO_BB_STATUS = {
  'Pending': 'confirmed',
  'Accepted': 'Accepted',
  'Preparing': 'Preparing',
  'Out for Delivery': 'Out for Delivery',
  'Delivered': 'Delivered',
  'Cancelled': 'cancelled',
  'Rejected': 'Rejected',
};

// ──────────── Category Mapping ────────────

const BB_TO_SK_CATEGORY = {
  'burgers': 'Burger',
  'veg': 'Starters',
  'sides': 'Snacks',
  'combos': 'Main Course',
  'drinks': 'Beverages',
  'desserts': 'Desserts',
  'chicken': 'Main Course',
  'pizza': 'Pizza',
};

const SK_TO_BB_CATEGORY = {
  'Burger': 'burgers',
  'Starters': 'veg',
  'Snacks': 'sides',
  'Main Course': 'combos',
  'Beverages': 'drinks',
  'Desserts': 'desserts',
  'Pizza': 'pizza',
  'Biryani': 'combos',
  'Chinese': 'combos',
  'South Indian': 'veg',
  'Thali': 'combos',
};

// ──────────── Product Lookup Cache ────────────

async function loadProductsMap() {
  const bbProducts = await readJson(productsFile);
  const map = {};
  for (const p of bbProducts) {
    map[String(p.id)] = p;
  }
  return map;
}

// ──────────── Order Transformations ────────────

function transformBBOrderToSK(bbOrder, productsMap = {}) {
  const skStatus = BB_TO_SK_STATUS[bbOrder.status] || bbOrder.status || 'Pending';
  const paymentMethod = (bbOrder.paymentMethod || 'cod').toUpperCase() === 'COD' ? 'COD' : 'Online';

  return {
    _id: bbOrder.orderId,
    orderNumber: bbOrder.orderId,
    customer: {
      _id: bbOrder.customer?.email || 'unknown',
      name: bbOrder.customer?.name || 'N/A',
      phone: bbOrder.customer?.phone || 'N/A',
      email: bbOrder.customer?.email || '',
      address: [bbOrder.customer?.address, bbOrder.customer?.city, bbOrder.customer?.pincode].filter(Boolean).join(', '),
    },
    items: (bbOrder.items || []).map(item => {
      const product = productsMap[String(item.id)] || {};
      return {
        menuItem: {
          _id: item.id,
          isVeg: product.veg === true || product.isVeg === true || item.veg === true,
          image: product.image || item.image || '',
          name: item.name,
          description: product.desc || product.description || '',
          category: product.category || '',
        },
        name: item.name,
        image: product.image || item.image || '',
        quantity: item.qty || item.quantity || 1,
        price: item.price,
      };
    }),
    totalAmount: bbOrder.total || bbOrder.subtotal || 0,
    status: skStatus,
    paymentMethod,
    paymentStatus: skStatus === 'Delivered' ? 'Paid' : 'Pending',
    deliveryAddress: [bbOrder.customer?.address, bbOrder.customer?.city, bbOrder.customer?.pincode].filter(Boolean).join(', '),
    deliveryInstructions: bbOrder.customer?.notes || '',
    estimatedDeliveryTime: parseInt(bbOrder.estimatedDelivery) || 35,
    timeline: bbOrder.timeline || [{ status: skStatus, timestamp: bbOrder.createdAt }],
    createdAt: bbOrder.createdAt,
    updatedAt: bbOrder.updatedAt || bbOrder.createdAt,
  };
}

// ──────────── Product Transformations ────────────

function transformBBProductToSK(bbProduct) {
  return {
    _id: String(bbProduct.id),
    name: bbProduct.name,
    description: bbProduct.desc || bbProduct.description || '',
    price: bbProduct.price,
    category: BB_TO_SK_CATEGORY[bbProduct.category] || bbProduct.category || 'Starters',
    image: bbProduct.image || '',
    isVeg: bbProduct.veg === true || bbProduct.isVeg === true,
    isAvailable: bbProduct.isAvailable !== false,
    preparationTime: bbProduct.preparationTime || 15,
    rating: bbProduct.rating || 0,
    oldPrice: bbProduct.oldPrice || null,
    tag: bbProduct.tag || '',
    tagColor: bbProduct.tagColor || '',
  };
}

function transformSKProductToBB(skProduct, existingId) {
  return {
    id: existingId || Date.now(),
    name: skProduct.name,
    desc: skProduct.description || '',
    description: skProduct.description || '',
    price: Number(skProduct.price),
    oldPrice: Number(skProduct.price) + 50,
    rating: skProduct.rating || 4.5,
    category: SK_TO_BB_CATEGORY[skProduct.category] || skProduct.category?.toLowerCase() || 'burgers',
    image: skProduct.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&fit=crop',
    tag: skProduct.tag || 'New',
    tagColor: skProduct.tagColor || '#6f42c1',
    veg: skProduct.isVeg === true,
    isVeg: skProduct.isVeg === true,
    isAvailable: skProduct.isAvailable !== false,
    preparationTime: Number(skProduct.preparationTime) || 15,
  };
}

// ──────────── Orders API ────────────

async function getOrders({ status, search, startDate, endDate, page = 1, limit = 20 } = {}) {
  const bbOrders = await readJson(ordersFile);
  const productsMap = await loadProductsMap();
  let skOrders = bbOrders.map(o => transformBBOrderToSK(o, productsMap));

  // Apply filters
  if (status && status !== 'All') {
    skOrders = skOrders.filter(o => o.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    skOrders = skOrders.filter(o =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.phone?.includes(q)
    );
  }

  if (startDate) {
    const start = new Date(startDate);
    skOrders = skOrders.filter(o => new Date(o.createdAt) >= start);
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    skOrders = skOrders.filter(o => new Date(o.createdAt) <= end);
  }

  // Sort newest first
  skOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = skOrders.length;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const paginated = skOrders.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return {
    orders: paginated,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  };
}

async function getOrderById(orderId) {
  const bbOrders = await readJson(ordersFile);
  const bbOrder = bbOrders.find(o => o.orderId === orderId);
  if (!bbOrder) return null;
  const productsMap = await loadProductsMap();
  return transformBBOrderToSK(bbOrder, productsMap);
}

async function updateOrderStatus(orderId, newStatus) {
  const bbOrders = await readJson(ordersFile);
  const idx = bbOrders.findIndex(o => o.orderId === orderId);
  if (idx === -1) return null;

  // Update status in BB format
  bbOrders[idx].status = SK_TO_BB_STATUS[newStatus] || newStatus;

  // Also store the SK status for display consistency
  if (!['confirmed', 'cancelled'].includes(newStatus.toLowerCase())) {
    bbOrders[idx].status = newStatus;
  }

  // Add timeline entry
  if (!bbOrders[idx].timeline) {
    bbOrders[idx].timeline = [{ status: 'Pending', timestamp: bbOrders[idx].createdAt }];
  }
  bbOrders[idx].timeline.push({ status: newStatus, timestamp: new Date().toISOString() });
  bbOrders[idx].updatedAt = new Date().toISOString();

  await writeJson(ordersFile, bbOrders);
  const productsMap = await loadProductsMap();
  return transformBBOrderToSK(bbOrders[idx], productsMap);
}

async function createOrderInBB(orderData) {
  const bbOrders = await readJson(ordersFile);
  const crypto = require('crypto');
  const orderId = 'BB-' + crypto.randomBytes(4).toString('hex').toUpperCase();

  const newOrder = {
    orderId,
    customer: {
      name: orderData.customerName || 'Walk-in',
      email: orderData.customerEmail || '',
      phone: orderData.customerPhone || '',
      address: orderData.deliveryAddress || '',
      city: '',
      pincode: '',
      notes: orderData.deliveryInstructions || '',
    },
    items: (orderData.items || []).map(item => ({
      id: item.menuItem || item.id,
      name: item.name,
      price: item.price,
      qty: item.quantity || item.qty || 1,
    })),
    paymentMethod: (orderData.paymentMethod || 'COD').toLowerCase(),
    subtotal: orderData.totalAmount,
    deliveryFee: 0,
    total: orderData.totalAmount,
    status: 'confirmed',
    estimatedDelivery: '30-40 minutes',
    timeline: [{ status: 'Pending', timestamp: new Date().toISOString() }],
    createdAt: new Date().toISOString(),
  };

  bbOrders.push(newOrder);
  await writeJson(ordersFile, bbOrders);
  const productsMap = await loadProductsMap();
  return transformBBOrderToSK(newOrder, productsMap);
}

// ──────────── Products API ────────────

async function getProducts({ category, search } = {}) {
  const bbProducts = await readJson(productsFile);
  let skProducts = bbProducts.map(transformBBProductToSK);

  if (category && category !== 'All') {
    skProducts = skProducts.filter(p => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    skProducts = skProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  return skProducts;
}

async function getProductById(productId) {
  const bbProducts = await readJson(productsFile);
  const p = bbProducts.find(item => String(item.id) === String(productId));
  if (!p) return null;
  return transformBBProductToSK(p);
}

async function createProduct(productData) {
  const bbProducts = await readJson(productsFile);

  // Generate next ID
  const maxId = bbProducts.reduce((max, p) => Math.max(max, typeof p.id === 'number' ? p.id : 0), 0);
  const newProduct = transformSKProductToBB(productData, maxId + 1);

  bbProducts.push(newProduct);
  await writeJson(productsFile, bbProducts);
  return transformBBProductToSK(newProduct);
}

async function updateProduct(productId, productData) {
  const bbProducts = await readJson(productsFile);
  const idx = bbProducts.findIndex(p => String(p.id) === String(productId));
  if (idx === -1) return null;

  // Merge the update with existing data
  const existing = bbProducts[idx];
  const updated = {
    ...existing,
    name: productData.name || existing.name,
    desc: productData.description || existing.desc,
    description: productData.description || existing.description || existing.desc,
    price: Number(productData.price) || existing.price,
    category: SK_TO_BB_CATEGORY[productData.category] || productData.category?.toLowerCase() || existing.category,
    veg: productData.isVeg !== undefined ? productData.isVeg : existing.veg,
    isVeg: productData.isVeg !== undefined ? productData.isVeg : existing.isVeg,
    isAvailable: productData.isAvailable !== undefined ? productData.isAvailable : existing.isAvailable,
    preparationTime: Number(productData.preparationTime) || existing.preparationTime,
  };

  bbProducts[idx] = updated;
  await writeJson(productsFile, bbProducts);
  return transformBBProductToSK(updated);
}

async function deleteProduct(productId) {
  const bbProducts = await readJson(productsFile);
  const idx = bbProducts.findIndex(p => String(p.id) === String(productId));
  if (idx === -1) return false;
  bbProducts.splice(idx, 1);
  await writeJson(productsFile, bbProducts);
  return true;
}

async function toggleProductAvailability(productId) {
  const bbProducts = await readJson(productsFile);
  const idx = bbProducts.findIndex(p => String(p.id) === String(productId));
  if (idx === -1) return null;
  bbProducts[idx].isAvailable = !bbProducts[idx].isAvailable;
  await writeJson(productsFile, bbProducts);
  return transformBBProductToSK(bbProducts[idx]);
}

// ──────────── Customers (derived from orders) ────────────

async function getCustomers({ search } = {}) {
  const bbOrders = await readJson(ordersFile);

  // Group by customer email
  const customerMap = {};
  for (const order of bbOrders) {
    const email = order.customer?.email || 'unknown';
    if (!customerMap[email]) {
      customerMap[email] = {
        _id: email,
        name: order.customer?.name || 'N/A',
        phone: order.customer?.phone || 'N/A',
        email,
        address: [order.customer?.address, order.customer?.city].filter(Boolean).join(', '),
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
        orders: [],
      };
    }
    customerMap[email].totalOrders++;
    customerMap[email].totalSpent += order.total || 0;
    const orderDate = new Date(order.createdAt);
    if (!customerMap[email].lastOrderDate || orderDate > new Date(customerMap[email].lastOrderDate)) {
      customerMap[email].lastOrderDate = order.createdAt;
    }
    customerMap[email].orders.push(order.orderId);
  }

  let customers = Object.values(customerMap);

  if (search) {
    const q = search.toLowerCase();
    customers = customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  }

  customers.sort((a, b) => b.totalOrders - a.totalOrders);
  return customers;
}

async function getCustomerOrders(customerId) {
  const bbOrders = await readJson(ordersFile);
  const productsMap = await loadProductsMap();
  const customerOrders = bbOrders.filter(o =>
    (o.customer?.email || 'unknown') === customerId
  );
  return customerOrders.map(o => transformBBOrderToSK(o, productsMap)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ──────────── Payments (derived from orders) ────────────

async function getPayments({ method, status, startDate, endDate, page = 1, limit = 20 } = {}) {
  const bbOrders = await readJson(ordersFile);

  let payments = bbOrders.map(order => {
    const skStatus = BB_TO_SK_STATUS[order.status] || order.status;
    const paymentMethod = (order.paymentMethod || 'cod').toUpperCase() === 'COD' ? 'COD' : 'Online';
    let paymentStatus = 'Pending';
    if (skStatus === 'Delivered') paymentStatus = 'Completed';
    else if (skStatus === 'Cancelled' || skStatus === 'Rejected') paymentStatus = 'Failed';

    return {
      _id: order.orderId + '-pay',
      order: { _id: order.orderId, orderNumber: order.orderId, status: skStatus },
      amount: order.total || 0,
      paymentMethod,
      status: paymentStatus,
      transactionId: paymentMethod === 'Online' ? `TXN-${order.orderId}` : '',
      createdAt: order.createdAt,
    };
  });

  if (method) payments = payments.filter(p => p.paymentMethod === method);
  if (status) payments = payments.filter(p => p.status === status);
  if (startDate) payments = payments.filter(p => new Date(p.createdAt) >= new Date(startDate));
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    payments = payments.filter(p => new Date(p.createdAt) <= end);
  }

  payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = payments.length;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const paginated = payments.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return { payments: paginated, total, page: pageNum, pages: Math.ceil(total / limitNum) };
}

async function getEarnings() {
  const bbOrders = await readJson(ordersFile);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let total = 0, thisMonth = 0, todayEarnings = 0, pending = 0;
  const monthlyMap = {};

  for (const order of bbOrders) {
    const skStatus = BB_TO_SK_STATUS[order.status] || order.status;
    const amount = order.total || 0;
    const orderDate = new Date(order.createdAt);

    if (skStatus === 'Delivered') {
      total += amount;
      if (orderDate >= thisMonthStart) thisMonth += amount;
      if (orderDate >= today) todayEarnings += amount;

      const monthKey = orderDate.getMonth() + 1;
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + amount;
    } else if (!['Cancelled', 'Rejected'].includes(skStatus)) {
      pending += amount;
    }
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyChart = months.map((month, i) => ({
    month,
    earnings: monthlyMap[i + 1] || 0,
  }));

  return { total, thisMonth, today: todayEarnings, pending, monthlyChart };
}

async function getPaymentSummary() {
  const bbOrders = await readJson(ordersFile);
  const result = { COD: { total: 0, count: 0 }, Online: { total: 0, count: 0 } };

  for (const order of bbOrders) {
    const paymentMethod = (order.paymentMethod || 'cod').toUpperCase() === 'COD' ? 'COD' : 'Online';
    result[paymentMethod].total += order.total || 0;
    result[paymentMethod].count++;
  }

  return result;
}

// ──────────── Dashboard Stats ────────────

async function getDashboardStats() {
  const bbOrders = await readJson(ordersFile);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let totalOrders = bbOrders.length;
  let totalRevenue = 0, pendingOrders = 0, deliveredOrders = 0, cancelledOrders = 0;
  let todaySales = 0, todayRevenue = 0;

  for (const order of bbOrders) {
    const skStatus = BB_TO_SK_STATUS[order.status] || order.status;
    const amount = order.total || 0;
    const orderDate = new Date(order.createdAt);

    if (skStatus === 'Delivered') {
      totalRevenue += amount;
      deliveredOrders++;
    }
    if (skStatus === 'Pending' || skStatus === 'Accepted' || skStatus === 'Preparing') {
      pendingOrders++;
    }
    if (skStatus === 'Cancelled' || skStatus === 'Rejected') {
      cancelledOrders++;
    }

    if (orderDate >= today) {
      todaySales++;
      todayRevenue += amount;
    }
  }

  return { totalOrders, totalRevenue, pendingOrders, deliveredOrders, cancelledOrders, todaySales, todayRevenue };
}

async function getWeeklySales() {
  const bbOrders = await readJson(ordersFile);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dayMap = {};
  for (const order of bbOrders) {
    const orderDate = new Date(order.createdAt);
    if (orderDate >= sevenDaysAgo) {
      const dayOfWeek = orderDate.getDay(); // 0=Sun, 1=Mon...
      if (!dayMap[dayOfWeek]) dayMap[dayOfWeek] = { orders: 0, revenue: 0 };
      dayMap[dayOfWeek].orders++;
      dayMap[dayOfWeek].revenue += order.total || 0;
    }
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days.map((day, i) => ({
    day,
    orders: dayMap[i]?.orders || 0,
    revenue: dayMap[i]?.revenue || 0,
  }));
}

async function getRecentOrders(limit = 10) {
  const bbOrders = await readJson(ordersFile);
  const productsMap = await loadProductsMap();
  const skOrders = bbOrders.map(o => transformBBOrderToSK(o, productsMap));
  skOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return skOrders.slice(0, limit);
}

module.exports = {
  // Orders
  getOrders,
  getOrderById,
  updateOrderStatus,
  createOrderInBB,
  // Products
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  // Customers
  getCustomers,
  getCustomerOrders,
  // Payments
  getPayments,
  getEarnings,
  getPaymentSummary,
  // Dashboard
  getDashboardStats,
  getWeeklySales,
  getRecentOrders,
};
